import { listenToVendorInviteQueue } from "./VendorInviteListener";

export const main=async()=>{
  await listenToVendorInviteQueue();
}