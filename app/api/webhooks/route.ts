
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';



export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local');
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  const { type, data } = evt;

  try {
    if (type === 'user.created') {
      console.log(`User Created: ${data.id}`);
      await saveUserToDatabase(data);
    } else if (type === 'user.updated') {
      console.log(`User Updated: ${data.id}`);
      await updateUserInDatabase(data);
    } else if (type === 'user.deleted') {
      console.log(`User Deleted: ${data.id}`);
      if(data?.id){
      await deleteUserFromDatabase(data?.id);
      }
    } else {
      console.log(`Unhandled event type: ${type}`);
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response('Error processing webhook', { status: 500 });
  }
}

async function saveUserToDatabase(data: any) {
  try {
    // Create the user
    const user = await prisma.user.create({
      data: {
        id: data.id,
        data: {
          birthday: data.birthday,
          email_addresses: data.email_addresses,
          external_accounts: data.external_accounts,
          external_id: data.external_id,
          first_name: data.first_name,
          gender: data.gender,
          image_url: data.image_url,
          last_name: data.last_name,
          public_metadata: data.public_metadata,
          private_metadata: data.private_metadata,
          updated_at: data.updated_at,
        },
      },
    });

    // Create the default store for the user
    await prisma.store.create({
      data: {
        name: "My Store", // Default store name
        ownerId: user.id, // Set the user as the store owner
        settings: {
          general: {
            brandName: "",
            website: "",
            facebookUrl: "",
            instagramUrl: "",
            tiktokUrl: "",
            cateringUrl: "",
            timezone: "",
            salesTax: 0,
          },
          contact: {
            email: "",
            phone: "",
          },
          fulfillment: {
            prepTime: 15,
            largeOrderThreshold: 10,
            largeOrderPrepTime: 30,
          },
        }, // Default settings
      },
    });

    console.log(`User ${data.id} and their store "My Store" successfully created in the database.`);
  } catch (err) {
    console.error(`Error saving user ${data.id}:`, err);
    throw err;
  }
}


async function updateUserInDatabase(data: any) {
  try {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        data: {
          birthday: data.birthday,
          email_addresses: data.email_addresses,
          external_accounts: data.external_accounts,
          external_id: data.external_id,
          first_name: data.first_name,
          gender: data.gender,
          image_url: data.image_url,
          last_name: data.last_name,
          public_metadata: data.public_metadata,
          private_metadata: data.private_metadata,
          updated_at: data.updated_at,
        },
      },
    });
    console.log(`User ${data.id} successfully updated in the database.`);
  } catch (err) {
    console.error(`Error updating user ${data.id}:`, err);
    throw err;
  }
}

async function deleteUserFromDatabase(userId: string ) {
          
  try {
    await prisma.user.deleteMany({
      where: { id: {contains: userId}},
    });
    console.log(`User ${userId} successfully deleted from the database.`);
  } catch (err) {
    console.error(`Error deleting user ${userId}:`, err);
    throw err;
  }
}
