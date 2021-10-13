import { describe } from "mocha";
import { expect } from "chai";
import { compile, version } from "../src/compile";
import { compiler } from "../src/config";

describe("compile test", () => {
  // the tests container
  it("checking compile result", async () => {
    const result = await compile("Vault.solpp");

    const bytecode =
      "60806040523480156100115760006000fd5b5060405161089238038061089283398181016040528101906100339190610082565b5b80600060006101000a81548169ffffffffffffffffffff021916908369ffffffffffffffffffff1602179055505b506100f3566100f2565b60008151905061007b816100d7565b5b92915050565b6000602082840312156100955760006000fd5b60006100a38482850161006c565b9150505b92915050565b60006100b8826100c0565b90505b919050565b600069ffffffffffffffffffff821690505b919050565b6100e0816100ad565b811415156100ee5760006000fd5b5b50565b5b610790806101026000396000f3fe6080604052610196565b7fe94d99ea7b644f884668342e444493c18b43924c397e0520585a8a19a37e436e83838360405161003c93929190610591565b60405180910390a15b505050565b600060009054906101000a900469ffffffffffffffffffff1669ffffffffffffffffffff164669ffffffffffffffffffff161415156100be576040517f4b2bae7e0000000000000000000000000000000000000000000000000000000081526004016100b5906105c9565b60405180910390fd5b8034141515610102576040517f4b2bae7e0000000000000000000000000000000000000000000000000000000081526004016100f9906105ea565b60405180910390fd5b60006001600050548484846002600050546040516020016101279594939291906104f5565b6040516020818303038152906040528051906020012090507fe9d9269ac9229e8279efb51c2e7445635eeec90ecbd27cc7de805b71584b877c8186868686604051610176959493929190610542565b60405180910390a180600260005081909060001916905550505b50505050565b600436106101bf5760003560e01c8063040557c4146101c5578063f010006514610239576101bf565b60006000fd5b3480156101d25760006000fd5b506101ed60048036038101906101e891906103a7565b610009565b366068116102375760643560e01c8015610237576040519063ffffffff1660e01b815260040180606880360380929190913701604051809103906000692445f6e5cde8c2c70e4433f15b005b610253600480360381019061024e9190610336565b61004a565b3660681161029d5760643560e01c801561029d576040519063ffffffff1660e01b815260040180606880360380929190913701604051809103906000692445f6e5cde8c2c70e4433f15b00610763565b6000813590506102b281610712565b5b92915050565b6000813590506102c88161072d565b5b92915050565b6000600083601f84011215156102e55760006000fd5b8235905067ffffffffffffffff8111156102ff5760006000fd5b6020830191508360018202830111156103185760006000fd5b5b9250929050565b60008135905061032f81610748565b5b92915050565b60006000600060006060858703121561034f5760006000fd5b600061035d878288016102a3565b945050602085013567ffffffffffffffff81111561037b5760006000fd5b610387878288016102cf565b9350935050604061039a87828801610320565b9150505b92959194509250565b600060006000606084860312156103be5760006000fd5b60006103cc868287016102b9565b93505060206103dd868287016102a3565b92505060406103ee86828701610320565b9150505b9250925092565b6104028161063b565b82525b5050565b6104128161064e565b82525b5050565b61042a6104258261064e565b610696565b82525b5050565b600061043d838561060b565b935061044a838584610686565b610453836106ac565b840190505b9392505050565b600061046b838561061d565b9350610478838584610686565b82840190505b9392505050565b6000610492600f83610629565b915061049d826106be565b6020820190505b919050565b60006104b6600d83610629565b91506104c1826106e8565b6020820190505b919050565b6104d68161067b565b82525b5050565b6104ee6104e98261067b565b6106a1565b82525b5050565b60006105018288610419565b60208201915061051282868861045f565b915061051e82856104dd565b60208201915061052e8284610419565b6020820191508190505b9695505050505050565b60006080820190506105576000830188610409565b61056460208301876103f9565b8181036040830152610577818587610431565b905061058660608301846104cd565b5b9695505050505050565b60006060820190506105a66000830186610409565b6105b360208301856103f9565b6105c060408301846104cd565b5b949350505050565b600060208201905081810360008301526105e281610485565b90505b919050565b60006020820190508181036000830152610603816104a9565b90505b919050565b60008282526020820190505b92915050565b60008190505b92915050565b60008282526020820190505b92915050565b600061064682610659565b90505b919050565b60008190505b919050565b600074ffffffffffffffffffffffffffffffffffffffffff821690505b919050565b60008190505b919050565b828183376000838301525b505050565b60008190505b919050565b60008190505b919050565b6000601f19601f83011690505b919050565b7f7265717569726520746f6b656e6964000000000000000000000000000000000060008201525b50565b7f726571756972652076616c75650000000000000000000000000000000000000060008201525b50565b61071b8161063b565b811415156107295760006000fd5b5b50565b6107368161064e565b811415156107445760006000fd5b5b50565b6107518161067b565b8114151561075f5760006000fd5b5b50565bfea165627a7a7230582000000000000000000000000000000000000000000000000000000000000000000029";
    // result.byteCodeArr
    expect(result.byteCodeArr[0]).to.equal(bytecode);
  });

  it("checking compile version", async () => {
    const result = await version();

    // 0.8.0-develop.2021.9.17+commit.a9855af1.Linux.clang
    expect(result).contains(compiler.version.replace("v", ""));
    console.log(result);
  });
});
