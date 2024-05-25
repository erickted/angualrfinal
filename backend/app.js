const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const Post = require('./models/post');
const User = require('./models/user');

const app = express();
const router = express.Router();

app.use(cors()); // Use the cors middleware

mongoose.connect("mongodb+srv://zeddomanais0421:cedric04@cluster0.bwnspso.mongodb.net/node-angular?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log('Connected to the database!')
    })
    .catch(() => {
        console.log('Connection failed!')
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
   next();
});

app.post("/api/posts", (req, res, next) => {
    // Provide a default image URL if none is provided
    const defaultImageUrl = '';
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imageUrl: req.body.imageUrl || defaultImageUrl // Use the default image URL if none is provided
    });

    post.save()
        .then(createdPost => {
            console.log(createdPost);
            res.status(201).json({
                message: 'Post added successfully',
                postId: createdPost._id
            });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({
                error: error
            });
        });
});

app.get("/api/posts", (req, res, next) => {
    Post.find().then(documents => {
        res.status(200).json({
            message: 'Posts fetched successfully',
            posts: documents
        });
    })
    .catch(error => { // Add a .catch() block to handle errors
        console.error(error);
        res.status(500).json({
            error: error
        });
    });
});

app.put("/api/posts/:id", (req, res, next) => {
    const postId = req.params.id;
    const updatedPost = {
       title: req.body.title,
       content: req.body.content,
       imageUrl: req.body.imageUrl || null // Set imageUrl to null if none is provided
    };
   
    Post.findByIdAndUpdate(postId, updatedPost, { new: true })
       .then(updatedPost => {
         if (!updatedPost) {
           return res.status(404).json({
             message: "Post not found"
           });
         }
         res.status(200).json({
           message: 'Post updated successfully',
           post: updatedPost
         });
       })
       .catch(error => {
         console.error(error);
         res.status(500).json({
           error: error
         });
       });
   });

   app.delete('/api/posts/:id', async (req, res) => {
    try {
       const postId = req.params.id;
       await Post.findByIdAndDelete(postId);
       res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Error deleting post', error });
    }
   });


   app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
   
    // Simple validation (you might want to use a library like Joi for more complex validation)
    if (!email || !password) {
       return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds, you can adjust this value

        // Create a new user with the hashed password
        const user = new User({
           email,
           password: hashedPassword, // Use the hashed password here
        });

        // Save the user to the database
        user.save()
           .then(user => res.json({ message: 'User created successfully', user }))
           .catch(err => res.status(500).json({ message: 'Error creating user', error: err }));
    } catch (error) {
        // Handle any errors that occur during the hashing process
        console.error('Error hashing password', error);
        res.status(500).json({ message: 'Error hashing password', error: error });
    }
});

   const bcrypt = require('bcrypt'); // For hashing passwords
   const jwt = require('jsonwebtoken');

   app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
   
    try {
       const user = await User.findOne({ email });
       if (!user) {
         return res.status(401).json({ message: 'Invalid credentials' });
       }
   
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
         return res.status(401).json({ message: 'Invalid credentials' });
       }
   
       const token = jwt.sign({ email: user.email }, 'your_secret_key', { expiresIn: '1h' });
       res.json({ token });
    } catch (error) {
       console.error('Error during login', error);
       res.status(500).json({ message: 'Server error' });
    }
   });


  
module.exports = app;