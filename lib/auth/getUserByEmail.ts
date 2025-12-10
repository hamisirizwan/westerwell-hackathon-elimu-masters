"use server";

import dbConnect from "@/db/dbConnect";
import { User } from "@/db/models/UserModel";

export const getUserByEmail = async (email: string) => {
  try {
    await dbConnect();

    const user = await User.findOne({ email });

    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    await dbConnect();

    const user = await User.findById(id);

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

