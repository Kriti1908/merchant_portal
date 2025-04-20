import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, X, PlusCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import "./generate-api-style.css";

const SERVICE_TYPES = [
  "Customer Support",
  "Sales",
  "Product Information",
  "Technical Support",
];

const SAMPLE_DOCS = {
  companyInfo: "/samples/company-info.pdf",
  faq: "/samples/faq.pdf",
  products: "/samples/products.pdf",
};

type State = {
  name: string;
  utterances: string[];
  responses: string[];
  specification: string;
};

export default function GenerateApi() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [files, setFiles] = useState<{
    companyInfo?: File;
    faq?: File;
    products?: File;
  }>({});
  const [states, setStates] = useState<State[]>([]);
  // const navigate = useNavigate();

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      botName: "",
      serviceType: undefined,
      states: [],
    },
  });

  const createProject = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData, // Use the FormData directly
      });

      console.log(formData);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      if (!res.ok) {
        // Handle error responses
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create project");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Set initial states
    setStates([
      { name: "Welcome", utterances: ["How can I help you?", "Hi", "Hello", "Please tell me about your services"], responses: ["Hi, I am from Omo Bikes - India's first customized bike company. How can I help you today?"], specification: "Greet user and introduce chatbot capabilities" },
      { name: "ProductInfo", utterances: ["Tell me about your products", "What bikes do you offer?", "Show me your bikes"], responses: ["We offer a range of customized bikes including mountain bikes, road bikes, and hybrid bikes. You can check out our products on our website."], specification: "Provide information about products/services" },
      { name: "Recommendation", utterances: ["Which bike is best for me?", "Can you recommend a bike?", "I need help choosing a bike"], responses: ["Based on your needs, I would recommend our hybrid bike which is perfect for both city commuting and off-road adventures."], specification: "Suggest products/services based on user needs" },
      { name: "Closing", utterances: ["Thank you", "That's all", "Goodbye"], responses: ["Thank you for visiting Omo Bikes. If you have any more questions, feel free to ask. Have a great day!"], specification: "Thank user and provide next steps" }
    ]);
  }, []);

  const addState = () => {
    setStates([...states, { name: "", utterances: [], responses: [], specification: "" }]);
  };

  const removeState = (index: number) => {
    setStates(states.filter((_, i) => i !== index));
  };

  const updateState = (index: number, field: keyof State, value: string | string[]) => {
    const newStates = [...states];
    newStates[index] = { ...newStates[index], [field]: value };
    setStates(newStates);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(states);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setStates(items);
  };

  const handleSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    
    // Instead of sending the entire JSON data in one field,
    // append each field individually
    formData.append("name", data.name);
    formData.append("botName", data.botName);
    formData.append("serviceType", data.serviceType);
    // Append states data as a JSON string
    formData.append("statesData", JSON.stringify(states));
    
    // Only append files if they exist
    if (files.companyInfo) formData.append("companyInfo", files.companyInfo);
    if (files.faq) formData.append("faq", files.faq);
    if (files.products) formData.append("products", files.products);
    
    // createProject.mutate(formData);
    // Save form data in localStorage to pass it to the Choose Plan page
    localStorage.setItem("projectData", JSON.stringify(Object.fromEntries(formData)));

    // Redirect to Choose Plan page
    setLocation("/choose-plan");
  });

  return (
    <div className="generate-api-wrapper">
      <div className="generate-api-page">
        <Card className="glass-effect api-card">
          <CardHeader>
            <CardTitle>Generate New API Key</CardTitle>
            <CardDescription>
              Configure your chatbot and generate an API key
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={handleSubmit}
                className="api-form space-y-6"
              >
                <div className="form-row">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="form-item">
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="botName"
                    render={({ field }) => (
                      <FormItem className="form-item">
                        <FormLabel>Bot Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem className="form-item">
                        <FormLabel>Service Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SERVICE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

                <div >
                  <div className="form-section">
                    <h3 className="font-medium mb-2">Document Uploads</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 mt-4">
                      {Object.entries(SAMPLE_DOCS).map(([key, url]) => (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          Download {key} sample
                        </a>
                      ))}
                    </div>

                    <div className="mt-8 mb-2 space-y-4">
                      <FormItem className="form-item">
                        <FormLabel>Company Information</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.csv"
                            onChange={(e) =>
                              setFiles((prev) => ({
                                ...prev,
                                companyInfo: e.target.files?.[0],
                              }))
                            }
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="form-item">
                        <FormLabel>FAQ Document</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.csv"
                            onChange={(e) =>
                              setFiles((prev) => ({
                                ...prev,
                                faq: e.target.files?.[0],
                              }))
                            }
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="form-item">
                        <FormLabel>Products Document</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.csv"
                            onChange={(e) =>
                              setFiles((prev) => ({
                                ...prev,
                                products: e.target.files?.[0],
                              }))
                            }
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Bot States</h3>
                      <Button type="button" onClick={addState} variant="outline">
                        Add State
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <p className="text-sm text-muted-foreground">
                        Drag and drop states to define your chatbot's conversation flow. The states will be processed in the order shown.
                      </p>

                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="states">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-4 relative"
                            >
                              {states.map((state, index) => (
                                <Draggable
                                  key={index}
                                  draggableId={`state-${index}`}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="bot-state-card">
                                      <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center gap-2">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="drag-handle"
                                          >
                                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <Badge variant="outline" className="state-number-badge">
                                            {index + 1}
                                          </Badge>
                                        </div>
                                        
                                        <div className="flex-1 space-y-4">
                                          <FormItem>
                                            <FormLabel>State Name</FormLabel>
                                            <FormControl>
                                              <Input
                                                value={state.name}
                                                onChange={(e) =>
                                                  updateState(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Enter state name"
                                              />
                                            </FormControl>
                                          </FormItem>
                                          <FormItem>
                                            <FormLabel>Utterances</FormLabel>
                                            <FormControl>
                                            <Textarea
                                              value={state.utterances.join("\n")}
                                              onChange={(e) =>
                                                updateState(
                                                  index,
                                                  "utterances",
                                                  e.target.value.split("\n")
                                                )
                                              }
                                              placeholder="Enter utterances, one per line"
                                              rows={3}
                                            />
                                            </FormControl>
                                          </FormItem>
                                          <FormItem>
                                            <FormLabel>Responses</FormLabel>
                                            <FormControl>
                                            <Textarea
                                              value={state.responses.join("\n")}
                                              onChange={(e) =>
                                                updateState(
                                                  index,
                                                  "responses",
                                                  e.target.value.split("\n")
                                                )
                                              }
                                              placeholder="Enter responses, one per line"
                                              rows={3}
                                            />
                                            </FormControl>
                                          </FormItem>
                                          <FormItem>
                                            <FormLabel>Specification</FormLabel>
                                            <FormControl>
                                              <Textarea
                                                value={state.specification}
                                                onChange={(e) =>
                                                  updateState(
                                                    index,
                                                    "specification",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Describe what happens in this state"
                                                rows={3}
                                              />
                                            </FormControl>
                                          </FormItem>
                                        </div>
                                        
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeState(index)}
                                          className="text-muted-foreground hover:text-destructive"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              
                              {states.length === 0 && (
                                <div className="bg-muted/50 p-8 rounded-lg border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center">
                                  <p className="text-muted-foreground mb-4">No states defined. Add your first state to begin.</p>
                                  <Button 
                                    type="button" 
                                    onClick={addState} 
                                    variant="outline"
                                    className="flex items-center gap-2"
                                  >
                                    <PlusCircle className="h-4 w-4" />
                                    Add State
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createProject.isPending}
                >
                  Proceed to choose plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}