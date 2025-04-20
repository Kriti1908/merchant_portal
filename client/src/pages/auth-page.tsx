import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerUserSchema, type LoginData, type RegisterUser } from "@shared/schema";
import {
  Card,
  CardContent,
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
import "./auth-page.css";

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
      username: "",
      phone_no: "",
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
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="logo-container">
          <h1 className="logo">Aksion</h1>
        </div>
        
        <Card className="auth-card">
          <CardHeader className="auth-card-header">
            <CardTitle className="auth-title">Welcome to Aksion</CardTitle>
            <p className="auth-description">Create and manage custom chatbots for your business</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="auth-tabs">
              <TabsList className="auth-tabs-list">
                <TabsTrigger value="login" className="auth-tab">Login</TabsTrigger>
                <TabsTrigger value="register" className="auth-tab">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="auth-tab-content">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="auth-form"
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="form-item">
                          <FormLabel className="form-label">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="form-input" placeholder="your@email.com" />
                          </FormControl>
                          <FormMessage className="form-message" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="form-item">
                          <FormLabel className="form-label">Password</FormLabel>
                          <div className="password-input-container">
                            <FormControl>
                              <div className="input-with-icon">
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"} 
                                  className="form-input" 
                                  placeholder="••••••••"
                                />
                                <button
                                  type="button"
                                  className="password-toggle"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? 
                                    <EyeOff className="toggle-icon" /> : 
                                    <Eye className="toggle-icon" />
                                  }
                                </button>
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage className="form-message" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="submit-button"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="auth-tab-content">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit((data) => {
                      // Remove confirmPassword before sending to API
                      const { confirmPassword, ...userData } = data;
                      registerMutation.mutate(userData);
                    })}
                    className="auth-form"
                  >
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="form-item">
                          <FormLabel className="form-label">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="form-input" placeholder="your@email.com" />
                          </FormControl>
                          <FormMessage className="form-message" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="form-item">
                          <FormLabel className="form-label">Username</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" className="form-input" placeholder="Your username" />
                          </FormControl>
                          <FormMessage className="form-message" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phone_no"
                      render={({ field }) => (
                        <FormItem className="form-item">
                          <FormLabel className="form-label">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" className="form-input" placeholder="Your phone number" />
                          </FormControl>
                          <FormMessage className="form-message" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="form-item">
                          <FormLabel className="form-label">Password</FormLabel>
                          <div className="password-input-container">
                            <FormControl>
                              <div className="input-with-icon">
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"} 
                                  className="form-input"
                                  placeholder="••••••••" 
                                />
                                <button
                                  type="button"
                                  className="password-toggle"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? 
                                    <EyeOff className="toggle-icon" /> : 
                                    <Eye className="toggle-icon" />
                                  }
                                </button>
                              </div>
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="generate-password-button"
                              onClick={handleGeneratePassword}
                              title="Generate strong password"
                            >
                              <RefreshCcw className="generate-icon" />
                            </Button>
                          </div>
                          <PasswordValidation password={watchPassword} />
                          <FormMessage className="form-message" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="form-item">
                          <FormLabel className="form-label">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="input-with-icon">
                              <Input 
                                {...field} 
                                type={showConfirmPassword ? "text" : "password"} 
                                className="form-input"
                                placeholder="••••••••" 
                              />
                              <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? 
                                  <EyeOff className="toggle-icon" /> : 
                                  <Eye className="toggle-icon" />
                                }
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="form-message" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="submit-button"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="auth-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h2 className="hero-title">Power your business with AI</h2>
            <p className="hero-subtitle">Create custom chatbots tailored to your specific needs</p>
          </div>
        </div>
      </div>
    </div>
  );
}