import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { Project } from "./models/Project";
import multer from "multer";
import crypto from "crypto";
import { insertProjectSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import express from 'express';

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Middleware to parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // Get all projects for authenticated user
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const projects = await Project.find({ userId: req.user._id })
        .sort({ createdAt: -1 });
      res.json(projects);
    } catch (err) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });

  // Get a single project
  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const project = await Project.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (err) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });

  // Create new project with API key
  // Apply multer middleware only for file fields
  app.post("/api/projects", (req, res) => {
    const fileUpload = upload.fields([
      { name: 'companyInfo', maxCount: 1 },
      { name: 'faq', maxCount: 1 },
      { name: 'products', maxCount: 1 }
    ]);
  
    fileUpload(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      try {
        console.log('Request body:', req.body);
        
        // Get form fields directly
        const { name, botName, serviceType, statesData } = req.body;
        const states = JSON.parse(statesData || '[]');
        
        const validatedData = insertProjectSchema.parse({
          name,
          botName,
          serviceType,
          states
        });
        
        // Process files as before
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const documents = [];
        
        for (const [type, fileArray] of Object.entries(files)) {
          const file = fileArray[0];
          documents.push({
            originalName: file.originalname,
            fileName: file.filename,
            path: file.path,
            type: type
          });
        }
        
        const projectData = {
          ...validatedData,
          userId: req.user._id,
          apiKey: generateApiKey(),
          documents,
          states: validatedData.states || []
        };
        
        const project = await Project.create(projectData);
        res.status(201).json(project);
      } catch (err) {
        console.error('Error creating project:', err);
        res.status(400).json({ 
          message: err instanceof Error ? err.message : "Invalid request" 
        });
      }
    });
  });

  // Update project
  app.patch("/api/projects/:id", upload.fields([
    { name: 'companyInfo', maxCount: 1 },
    { name: 'faq', maxCount: 1 },
    { name: 'products', maxCount: 1 }
  ]), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const project = await Project.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const data = JSON.parse(req.body.data);
      const validatedData = insertProjectSchema.parse(data);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Update documents if new files are uploaded
      for (const [type, fileArray] of Object.entries(files)) {
        const file = fileArray[0];
        const existingDoc = project.documents.find(doc => doc.type === type);

        // Remove old file if it exists
        if (existingDoc && existingDoc.path) {
          fs.unlink(existingDoc.path, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
          });
        }

        // Add new document
        const docIndex = project.documents.findIndex(doc => doc.type === type);
        const newDoc = {
          originalName: file.originalname,
          fileName: file.filename,
          path: file.path,
          type: type,
          uploadedAt: new Date()
        };

        if (docIndex !== -1) {
          project.documents[docIndex] = newDoc;
        } else {
          project.documents.push(newDoc);
        }
      }

      // Update other fields
      Object.assign(project, {
        ...validatedData,
        states: validatedData.states.map((state, index) => ({
          ...state,
          order: index
        }))
      });

      await project.save();
      res.json(project);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Invalid request" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const project = await Project.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Delete associated files
      for (const doc of project.documents) {
        if (doc.path) {
          fs.unlink(doc.path, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
          });
        }
      }

      await Project.deleteOne({ _id: req.params.id });
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Error deleting project" });
    }
  });

  // Chat history endpoint
  app.get("/api/chat/history", async (req, res) => {
    const { apiKey } = req.query;
    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }

    try {
      const project = await Project.findOne({ apiKey });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Here you would typically fetch chat history from your database
      // For now, returning empty array
      res.json([]);
    } catch (err) {
      res.status(500).json({ message: "Error fetching chat history" });
    }
  });

  // Chat message endpoint
  app.post("/api/chat", async (req, res) => {
    const { message, apiKey } = req.body;
    
    if (!message || !apiKey) {
      return res.status(400).json({ message: "Message and API key are required" });
    }

    try {
      const project = await Project.findOne({ apiKey });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Here you would make the call to your Java OpenAI bot service
      // Replace this URL with your actual bot service URL
      const botResponse = await fetch("YOUR_JAVA_BOT_SERVICE_URL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          projectId: project._id,
        }),
      });

      if (!botResponse.ok) {
        throw new Error("Failed to get bot response");
      }

      const response = await botResponse.json();
      res.json({ message: response.message });
    } catch (err) {
      res.status(500).json({ message: "Error processing message" });
    }
  });

  app.post("/api/test-chat", async (req, res) => {
    const { message, apiKey } = req.body;
    
    if (!message || !apiKey) {
      return res.status(400).json({ message: "Message and API key are required" });
    }

    // Sample response
    res.json({ 
      message: "I am a sample bot, I cannot think, DONT BOTHER ME!!!" 
    });
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}