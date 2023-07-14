import { auth } from "@clerk/nextjs"; // Importing the auth function from the Clerk package for authentication
import { redirect } from "next/navigation"; // Importing the redirect function from Next.js for navigation

import prismadb from "@/lib/prismadb"; // Importing the prismadb module for database interaction
import { SettingsForm } from "./components/settings-form";

interface SettingsPageProps {
    params: {
        storeId: string; // Interface defining the expected props for the SettingsPage component, including a storeId of type string
    }
}

const SettingsPage: React.FC<SettingsPageProps> = async ({
    params
}) => {
    const { userId } = auth(); // Extracting the userId using the auth function

    if (!userId) {
        redirect("/sign-in"); // Redirecting to the sign-in page if the userId is falsy (user not authenticated)
    }

    const store = await prismadb.store.findFirst({
        where:{
            id: params.storeId, // Retrieving store data based on the provided storeId
            userId // Matching the store's userId with the authenticated user's ID
        }
    });

    if (!store) {
        redirect("/"); // Redirecting to the homepage if the store doesn't exist
    }

    return ( 
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <SettingsForm initialData={store} />
            </div>
        </div>
     );
}
 
export default SettingsPage;