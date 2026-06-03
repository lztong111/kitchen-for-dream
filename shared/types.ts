export interface User {
  id: number;
  username: string;
  avatar: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string | null;
}

export interface Ingredient {
  id: number;
  name: string;
  category: string | null;
}

export interface Dish {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  category_id: number | null;
  cook_time: number | null;
  difficulty: number;
  servings: number;
  created_at: string;
  updated_at: string;
  user?: User;
  category?: Category;
  steps?: Step[];
  dish_ingredients?: DishIngredient[];
  tags?: Tag[];
}

export interface Step {
  id: number;
  dish_id: number;
  step_number: number;
  description: string;
  image_url: string | null;
}

export interface DishIngredient {
  id: number;
  dish_id: number;
  ingredient_id: number;
  amount: string | null;
  unit: string | null;
  ingredient?: Ingredient;
}

export interface Tag {
  id: number;
  dish_id: number;
  name: string;
}

export interface DishListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  difficulty?: number;
  tag?: string;
}

export interface DishListResponse {
  dishes: Dish[];
  total: number;
  page: number;
  limit: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
