export function toUserDTO(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    age: user.age,
    role: user.role,
    cart: user.cart,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
} 