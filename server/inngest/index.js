import { Inngest } from "inngest";
import User from "../models/User.js";
import connectDB from "../configs/db.js";

export const inngest = new Inngest({ id: "pingup-app" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const email = email_addresses?.[0]?.email_address;
    if (!email) return;

    let username = email.split("@")[0];

    const existing = await User.findOne({ username });
    if (existing) {
      username += Math.floor(Math.random() * 10000);
    }

    await User.findByIdAndUpdate(
      id,
      {
        _id: id,
        email,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
        username,
      },
      { upsert: true }
    );
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const email = email_addresses?.[0]?.email_address;
    if (!email) return;

    await User.findByIdAndUpdate(id, {
      email,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
    });
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    await User.findByIdAndDelete(event.data.id);
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
];
