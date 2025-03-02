/**
 * User management actions
 */

/**
 * Delete an invited user
 * @param userId The ID of the invited user to delete
 */
export async function deleteInvitedUser(userId: number) {
  try {
    const response = await fetch(`/api/manage/users/invited/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.detail || "Unknown error" };
    }
  } catch (error) {
    console.error("Error deleting invited user:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Delete a user
 * @param userId The ID of the user to delete
 */
export async function deleteUser(userId: string) {
  try {
    const response = await fetch(`/api/manage/users/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.detail || "Unknown error" };
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Invite users by email
 * @param emails List of email addresses to invite
 */
export async function inviteUsers(emails: string[]) {
  try {
    return await fetch("/api/manage/users/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emails }),
    });
  } catch (error) {
    console.error("Error inviting users:", error);
    throw error;
  }
}