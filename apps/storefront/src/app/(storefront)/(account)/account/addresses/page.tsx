import { requireUser } from "@likiya/auth/server";

import { getMyAddresses } from "@/features/account/queries";
import { AddressList } from "./address-list";
import { AddressForm } from "./address-form";

export default async function AccountAddressesPage() {
  const user = await requireUser();
  const addresses = await getMyAddresses(user.id);

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl">Addresses</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <AddressList addresses={addresses} />
        <AddressForm />
      </div>
    </div>
  );
}
