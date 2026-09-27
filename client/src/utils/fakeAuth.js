const STORAGE_KEY = "dypconnect_users";

function getUsers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function registerUser(role, formData) {
  const users = getUsers();

  const alreadyExists = users.some(
    (u) => u.email.toLowerCase() === formData.email.toLowerCase()
  );

  if (alreadyExists) {
    return { success: false, message: "An account with this email already exists." };
  }

  users.push({ ...formData, role });
  saveUsers(users);
  return { success: true };
}

export function loginUser(role, email, password) {
  const users = getUsers();

  const match = users.find(
    (u) =>
      u.role === role &&
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
  );

  if (!match) {
    return { success: false, message: "Invalid email or password." };
  }

  localStorage.setItem("dypconnect_current_user", JSON.stringify(match));
  return { success: true, user: match };
}

export function getCurrentUser() {
  const raw = localStorage.getItem("dypconnect_current_user");
  return raw ? JSON.parse(raw) : null;
}

export function logoutUser() {
  localStorage.removeItem("dypconnect_current_user");
}