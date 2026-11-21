// Run: node scripts/check-profile.cjs. Uses isolated database/auth doubles; no real account is modified.
/* eslint-disable @typescript-eslint/no-require-imports -- This CommonJS harness loads transpiled server modules with isolated dependencies. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const bcrypt = require("bcryptjs");

function load(relative, mocks = {}) {
  const filename = path.resolve(__dirname, "..", relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = instance.require.bind(instance);
  instance.require = (name) => (Object.hasOwn(mocks, name) ? mocks[name] : originalRequire(name));
  instance._compile(compiled, filename);
  return instance.exports;
}

async function main() {
  let session = null;
  let written;
  let password = await bcrypt.hash("current123", 4);
  let image = null;
  const prisma = {
    user: {
      findUnique: async () => ({
        password,
        name: "Saved name",
        email: "saved@example.com",
        image,
        updatedAt: new Date(1000),
      }),
      update: async (args) => {
        written = args;
      },
      updateMany: async (args) => {
        written = args;
        return { count: 1 };
      },
    },
  };
  const auth = async () => session;
  const mocks = {
    "@/auth": { auth },
    "@/lib/prisma": { prisma },
    "next/cache": { revalidatePath() {} },
  };
  const { updateProfileAction, changePasswordAction } = load("lib/actions/profile.ts", mocks);
  const form = (values) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) data.set(key, value);
    return data;
  };
  const goodPassword = {
    currentPassword: "current123",
    newPassword: "replacement123",
    confirmPassword: "replacement123",
  };

  assert((await updateProfileAction(form({ name: "Someone" }))).error);
  assert((await changePasswordAction(form(goodPassword))).error);
  assert.equal(written, undefined);
  session = { user: { id: "owner" }, error: "RefreshTokenExpired" };
  assert((await updateProfileAction(form({ name: "Someone" }))).error);
  session = { user: { id: "owner" } };
  assert((await updateProfileAction(form({ name: "  " }))).error);
  assert((await updateProfileAction(form({ name: "a".repeat(81) }))).error);
  assert(
    (
      await updateProfileAction(
        form({
          name: "Name",
          avatar: new File(["<svg></svg>"], "fake.png", { type: "image/png" }),
        }),
      )
    ).error,
  );
  assert(
    (
      await updateProfileAction(
        form({ name: "Name", avatar: new File([new Uint8Array(256 * 1024 + 1)], "large.png") }),
      )
    ).error,
  );
  assert.equal(written, undefined);
  assert(
    (
      await updateProfileAction(
        form({ name: "  New name  ", id: "other-user", role: "ADMIN", email: "other@example.com" }),
      )
    ).success,
  );
  assert.deepEqual(written, { where: { id: "owner" }, data: { name: "New name" } });
  assert((await updateProfileAction(form({ name: "New name", removeAvatar: "true" }))).success);
  assert.equal(written.data.image, null);
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  );
  assert(
    (
      await updateProfileAction(
        form({ name: "New name", avatar: new File([png], "test.png", { type: "image/png" }) }),
      )
    ).success,
  );
  image = written.data.image;
  assert(image.startsWith("data:image/png;base64,"));

  assert(
    (await changePasswordAction(form({ ...goodPassword, currentPassword: "wrong123" }))).error,
  );
  assert((await changePasswordAction(form({ ...goodPassword, newPassword: "short" }))).error);
  assert(
    (await changePasswordAction(form({ ...goodPassword, confirmPassword: "mismatch" }))).error,
  );
  assert(
    (
      await changePasswordAction(
        form({ ...goodPassword, newPassword: "current123", confirmPassword: "current123" }),
      )
    ).error,
  );
  assert(
    (
      await changePasswordAction(
        form({ ...goodPassword, newPassword: "é".repeat(40), confirmPassword: "é".repeat(40) }),
      )
    ).error,
  );
  const previousHash = password;
  password = null;
  assert((await changePasswordAction(form(goodPassword))).error);
  password = previousHash;
  assert((await changePasswordAction(form(goodPassword))).success);
  assert.equal(written.where.id, "owner");
  assert.equal(written.where.password, previousHash);
  assert.notEqual(written.data.password, goodPassword.newPassword);
  assert(await bcrypt.compare(goodPassword.newPassword, written.data.password));

  const { profileImageUrl } = load("lib/profile-image.ts");
  assert.equal(profileImageUrl(image, new Date(1000)), "/api/profile/avatar?v=1000");
  assert.equal(profileImageUrl(null, new Date(1000)), null);
  const { GET } = load("app/api/profile/avatar/route.ts", mocks);
  const response = await GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
  session = null;
  assert.equal((await GET()).status, 401);
  session = { user: { id: "owner" } };
  image = null;
  assert.equal((await GET()).status, 404);

  let config;
  load("auth.ts", {
    "next-auth": (options) => {
      config = options;
      return {};
    },
    "next-auth/providers/credentials": (options) => options,
    "next-auth/providers/google": (options) => options,
    "@auth/prisma-adapter": { PrismaAdapter: () => ({}) },
    "@/lib/prisma": { prisma },
    "@/lib/profile-image": { profileImageUrl },
  });
  const token = {
    id: "owner",
    name: "Old name",
    picture: "old.png",
    role: "USER",
    accessTokenExpires: Date.now() + 10000,
    refreshTokenExpires: Date.now() + 60000,
  };
  let refreshed = await config.callbacks.jwt({
    token,
    trigger: "update",
    session: { name: "Untrusted", role: "ADMIN", image: "evil.png" },
  });
  assert.equal(refreshed.name, "Saved name");
  assert.equal(refreshed.role, "USER");
  assert.equal(refreshed.picture, null);
  image = `data:image/png;base64,${png.toString("base64")}`;
  refreshed = await config.callbacks.jwt({ token, trigger: "update" });
  assert.equal(refreshed.picture, "/api/profile/avatar?v=1000");
  const signedIn = await config.callbacks.jwt({
    token: { picture: image },
    user: { id: "owner", image },
    trigger: "signIn",
  });
  assert.equal(signedIn.picture, "/api/profile/avatar?v=1000");
  assert(!JSON.stringify(signedIn).includes("data:image/"));
  const invalid = await config.callbacks.jwt({
    token: { ...token, refreshTokenExpires: 0 },
    trigger: "update",
  });
  assert.equal(invalid.error, "RefreshTokenExpired");
  console.log(
    "Profile checks passed: authorization, validation, account ownership, avatar upload/removal/privacy, password hashing, trusted session refresh.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
