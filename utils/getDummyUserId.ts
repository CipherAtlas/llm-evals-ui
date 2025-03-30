// utils/getDummyUserId.ts
export function getDummyUserId() {
    const key = "dummy_user_id";
    let userId = localStorage.getItem(key);
    if (!userId) {
      // Generate a simple random string. In production, consider a UUID library.
      userId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(key, userId);
    }
    return userId;
  }
  