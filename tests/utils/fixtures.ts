import { LSP6TestContext, LSP6InternalsTestContext } from "./context";

export async function setupKeyManager(
  _context: LSP6TestContext,
  _permissionsKeys: string[],
  _permissionsValues: string[]
) {
  await _context.universalProfile
    .connect(_context.owner)
    .setData(_permissionsKeys, _permissionsValues);

  await _context.universalProfile
    .connect(_context.owner)
    .transferOwnership(_context.keyManager.address);
}

export async function setupKeyManagerHelper(
  _context: LSP6InternalsTestContext,
  _permissionsKeys: string[],
  _permissionsValues: string[]
) {
  await _context.universalProfile
    .connect(_context.owner)
    .setData(_permissionsKeys, _permissionsValues);

  await _context.universalProfile
    .connect(_context.owner)
    .transferOwnership(_context.keyManagerHelper.address);
}
