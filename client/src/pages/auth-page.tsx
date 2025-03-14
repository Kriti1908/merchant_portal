import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, registerUserSchema, type InsertUser, type LoginData, type RegisterUser } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordValidation } from "@/components/ui/password-validation";
import { generateStrongPassword } from "@/lib/password-generator";
import { Eye, EyeOff, RefreshCcw } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm<LoginData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchPassword = registerForm.watch("password");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleGeneratePassword = () => {
    const strongPassword = generateStrongPassword();
    registerForm.setValue("password", strongPassword);
    registerForm.setValue("confirmPassword", strongPassword);
    // Trigger validation
    registerForm.trigger("password");
    registerForm.trigger("confirmPassword");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Aksion</CardTitle>
            <CardDescription>
              Create and manage custom chatbots for your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="flex gap-2">
                          <FormControl>
                              <div className="relative w-full">
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"} 
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? 
                                    <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  }
                                </button>
                              </div>
                          </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit((data) => {
                      // Remove confirmPassword before sending to API
                      const { confirmPassword, ...userData } = data;
                      registerMutation.mutate(userData);
                    })}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <div className="relative w-full">
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"} 
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? 
                                    <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  }
                                </button>
                              </div>
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={handleGeneratePassword}
                              title="Generate strong password"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                          </div>
                          <PasswordValidation password={watchPassword} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative w-full">
                              <Input 
                                {...field} 
                                type={showConfirmPassword ? "text" : "password"} 
                                className="pr-10"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? 
                                  <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                }
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      Register
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div
        className="hidden md:block bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40")',
        }}
      />
    </div>
  );
}