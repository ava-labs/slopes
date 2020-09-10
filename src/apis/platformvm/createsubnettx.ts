/**
 * @packageDocumentation
 * @module API-PlatformVM-CreateSubnetTx
 */
import { Buffer } from 'buffer/';
import { BaseTx } from './basetx';
import { PlatformVMConstants } from './constants';
import { DefaultNetworkID } from '../../utils/constants';
import { TransferableOutput, SECPOwnerOutput} from './outputs';
import { TransferableInput } from './inputs';


export class CreateSubnetTx extends BaseTx {
    protected subnetOwners:SECPOwnerOutput = undefined;

    /**
     * Returns the id of the [[CreateSubnetTx]]
     */
    getTxType = ():number => {
      return PlatformVMConstants.CREATESUBNETTX;
    }

    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the reward address.
     */
    getSubnetOwners():SECPOwnerOutput {
        return this.subnetOwners;
    }

    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[CreateSubnetTx]], parses it, populates the class, and returns the length of the [[CreateSubnetTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[CreateSubnetTx]]
     * @param offset A number for the starting position in the bytes.
     *
     * @returns The length of the raw [[CreateSubnetTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes:Buffer, offset:number = 0):number {
        offset = super.fromBuffer(bytes, offset);
        this.subnetOwners = new SECPOwnerOutput();
        offset = this.subnetOwners.fromBuffer(bytes, offset);
        return offset;
      }
    
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[CreateSubnetTx]].
     */
    toBuffer():Buffer {
        if(typeof this.subnetOwners === "undefined" || !(this.subnetOwners instanceof SECPOwnerOutput)) {
            throw new Error("CreateSubnetTx.toBuffer -- this.subnetOwners is not a SECPOwnerOutput");
        }
        let barr:Array<Buffer> = [super.toBuffer(), this.subnetOwners.toBuffer()];
        return Buffer.concat(barr);
    }

    /**
     * Class representing an unsigned Create Subnet transaction.
     *
     * @param networkid Optional networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param subnetOwners Optional [[SECPOwnerOutput]] class for specifying who owns the subnet.
    */
  constructor(
    networkid:number = DefaultNetworkID, 
    blockchainid:Buffer = Buffer.alloc(32, 16), 
    subnetOwners:SECPOwnerOutput = undefined,
    outs:Array<TransferableOutput> = undefined, 
    ins:Array<TransferableInput> = undefined,
    memo:Buffer = undefined
  ) {
    super(networkid, blockchainid, outs, ins, memo);
    this.subnetOwners = subnetOwners;
  }
}
  