/**
 * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
 *                      10 x hex Opcodes to copy runtime code
 *                           into memory and return it
 *                             |                  |
 */ //                          V                  V
const runtimeCodeTemplate = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";
exports.runtimeCodeTemplate = runtimeCodeTemplate;
