import { PrismaClient, PlanSlug } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";


function loadEnv(file: string) {
    const p = path.join(process.cwd(), file);
    if (!fs.existsSync(p)) return;
    for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq === -1) continue;
        const k = t.slice(0, eq).trim();
        const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (k && !process.env[k]) process.env[k] = v;
    }
}
loadEnv(".env");
loadEnv(".env.local");

// Dùng DIRECT_URL (port 5432) để tránh pgbouncer pooling khi seed
const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("seeding plans....")
    const plansData = [
        {
            name: "Free",
            slug: "FREE" as PlanSlug,
            description: "Bắt đầu miễn phí, không cần thẻ tín dụng",
            priceMonthly: 0,
            priceYearly: 0,
            sortOrder: 1,
            features: [
                { key: "monthly_ai_credits", value: "10", label: "10 AI credits/tháng" },
                { key: "max_cv_count", value: "2", label: "Tối đa 2 CV" },
                { key: "pdf_export", value: "true", label: "Xuất PDF" },
                { key: "ai_enhance", value: "true", label: "AI viết lại nội dung" },
                { key: "ats_score", value: "false", label: "" },
                { key: "no_watermark", value: "false", label: "" },
                { key: "priority_support", value: "false", label: "" },
            ],
            templates: ["single", "two-col"],
        },
        {
            name: "Pro",
            slug: "PRO" as PlanSlug,
            description: "Dành cho người đang tìm việc nghiêm túc",
            priceMonthly: 99000,
            priceYearly: 950000,
            sortOrder: 2,
            stripePriceIdMonthly: process.env.STRIPE_PRO_PRICE_MONTHLY ?? null,
            stripePriceIdYearly: process.env.STRIPE_PRO_PRICE_YEARLY ?? null,
            features: [
                { key: "monthly_ai_credits", value: "100", label: "100 AI credits/tháng" },
                { key: "max_cv_count", value: "20", label: "Tối đa 20 CV" },
                { key: "pdf_export", value: "true", label: "Xuất PDF chất lượng cao" },
                { key: "ai_enhance", value: "true", label: "AI viết lại nội dung" },
                { key: "ats_score", value: "true", label: "Phân tích ATS Score" },
                { key: "no_watermark", value: "true", label: "Không watermark" },
                { key: "priority_support", value: "false", label: "" },
            ],
            templates: ["single", "two-col", "sidebar", "harvard"],
        },
        {
            name: "Premium",
            slug: "PREMIUM" as PlanSlug,
            description: "Cho chuyên gia và dân HR",
            priceMonthly: 199000,
            priceYearly: 1900000,
            sortOrder: 3,
            stripePriceIdMonthly: process.env.STRIPE_PREMIUM_PRICE_MONTHLY ?? null,
            stripePriceIdYearly: process.env.STRIPE_PREMIUM_PRICE_YEARLY ?? null,
            features: [
                { key: "monthly_ai_credits", value: "500", label: "500 AI credits/tháng" },
                { key: "max_cv_count", value: "-1", label: "CV không giới hạn" },
                { key: "pdf_export", value: "true", label: "Xuất PDF chất lượng cao" },
                { key: "ai_enhance", value: "true", label: "AI viết lại nội dung" },
                { key: "ats_score", value: "true", label: "Phân tích ATS Score" },
                { key: "no_watermark", value: "true", label: "Không watermark" },
                { key: "priority_support", value: "true", label: "Hỗ trợ ưu tiên 24/7" },
            ],
            templates: ["single", "two-col", "sidebar", "harvard"],
        },
    ];

    for (const planData of plansData) {
        const { features, templates, stripePriceIdMonthly, stripePriceIdYearly, ...rest } = planData;

        const plan = await prisma.plan.upsert({
            where: { slug: rest.slug },
            create: {
                ...rest,
                stripePriceIdMonthly: stripePriceIdMonthly ?? undefined,
                stripePriceIdYearly: stripePriceIdYearly ?? undefined,
            },
            update: {
                name: rest.name,
                priceMonthly: rest.priceMonthly,
                priceYearly: rest.priceYearly,
                stripePriceIdMonthly: stripePriceIdMonthly ?? undefined,
                stripePriceIdYearly: stripePriceIdYearly ?? undefined,
            }
        });

        await prisma.planFeature.deleteMany({ where: { planId: plan.id } });
        await prisma.planFeature.createMany({
            data: features.map((f) => ({ ...f, planId: plan.id })),
        });

        await prisma.planTemplate.deleteMany({ where: { planId: plan.id } });
        await prisma.planTemplate.createMany({
            data: templates.map((templateId) => ({ planId: plan.id, templateId }))
        });

        console.log(`seeding plan : ${plan.name}`);
    }

    console.log("\n backfilling existing users...");
    const freePlan = await prisma.plan.findUnique({ where: { slug: "FREE" } });
    if (!freePlan) throw new Error("FREE plan not found");

    const userWithoutSub = await prisma.user.findMany({
        where: { subscription: null },
    })

    for (const user of userWithoutSub) {
        await prisma.subscription.create({
            data: {
                userId: user.id,
                planId: freePlan.id,
                status: "ACTIVE",
                provider: "MANUAL",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date("2099-12-31"),
            },
        });

        const wallet = await prisma.creditWallet.create({
            data: { userId: user.id, balance: 10 },
        });

        await prisma.creditTransaction.create({
            data: {
                walletId: wallet.id,
                type: "SUBSCRIPTION_GRANT",
                amount: 10,
                balanceBefore: 0,
                balanceAfter: 10,
                description: "Initial FREE plan credits",
            },
        });

        console.log(`backfilled : ${user.email}`)
    }
    console.log("seed completed")
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect()
    })