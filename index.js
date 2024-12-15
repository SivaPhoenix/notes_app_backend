require("dotenv").config();

const config=require("./config.json");
const mongoose=require("mongoose");
mongoose.connect(config.connectionString)


const User=require("./modals/user.modal.js")
const Note=require("./modals/note.modal.js")

const express=require('express')
const cors=require('cors')
const app=express()

const jwt=require("jsonwebtoken")
const {authenticateToken}=require("./utilities")


app.use(express.json())

app.use(
    cors({
        origin:'*',
    })
)

app.get("/",(req,res)=>{
    res.json({data:"hello"});
})
//create account
app.post("/create-account",async (req,res)=>{
    const {fullName, email, password}=req.body;
    if(!fullName){
        return res.status(400).json({error:true,message:"Full Name is required"});
    }

    if(!email){
        return res.status(400).json({error:true,message:"Email is required"});
    }
    if(!password){
        return res.status(400).json({error:true,message:"Password is required"});
    }

    const isUser=await User.findOne({email:email})

    if(isUser){
        return res.status(400).json({error:true,message:"Email already exists"});
    }

    const user=new User({fullName,email,password})
    await user.save();

    const accessToken=jwt.sign({ user},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '30m',
    });
    return res.json({
        error:false,
        user,
        message:"Account created successfully",
        accessToken,
    })
})

//login
app.post("/login", async(req,res)=>{

    const {email,password}=req.body;
    if(!email){
        return res.status(400).json({error:true,message:"Email is required"});
    }
    if(!password){
        return res.status(400).json({error:true,message:"Password is required"});
    }
    const userInfo=await User.findOne({email:email});
    if(!userInfo){
        return res.status(400).json({error:true,message:"User is not found"});
    }
    if(userInfo.email==email&&userInfo.password==password){
        const user={user:userInfo};
        const accessToken=jwt.sign({ user},process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '30m',
        });
        return res.json({
            error: false,
            user,
            message:"Logged in successfully",
            accessToken,
        })
    }
    else{
        return res.status(400).json({error:true,message:"Invalid email or password"});
    }
})

//get user
app.get('/get-user',authenticateToken,async(req,res)=>{
    const {user}=req.user;
    try{
        const isUser=await Note.findOne({userId:user._id});
        if(!isUser){
            return res.status(401)
        }
        return res.json({
            user: isUser,
            message: "User retrieved successfully",
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({error:true,message:"Server error"});
    }
})

//Add Notes
app.post('/add-note',authenticateToken,async(req,res)=>{
    const {title,content,tags}=req.body;
    const {user}=req.user;
    if(!title){
        return res.status(400).json({error:true,message:"Title is required"});
    }
    if(!content){
        return res.status(400).json({error:true,message:"Content is required"});
    }
    try{
        const note=new Note({
            title,
            content,
            tags:tags||[],
            userId:user._id
        })
        await note.save();
        return res.json({
            error:false,
            message:"Note added successfully",
            note
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({error:true,message:"Server error"});
    } 
})
//edit note
app.put('/edit-note/:noteId',authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {title,content,tags,isPinned}=req.body;
    const {user}=req.user;
    if(!title&&!content&&!tags){
        return res
        .status(400)
        .json({error:true,message:"No Changes Provided"});
    }

    try{
        const note=await Note.findOne(
            {
                _id:noteId,
                userId:user._id
            }
        )
        if(!note){
            return res
            .status(404).
            json({error:true,message:"Note not found"});
        }
        if(title) note.title = title;
        if(content) note.content = content;
        if(tags) note.tags = tags;
        if(isPinned) note.isPinned = isPinned;
        await note.save();
        return res.json({
            error: false,
            message:"Note updated successfully",
            note
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({error:true,message:"Server error"});
    }
})
//get all notes
app.get('/get-all-note',authenticateToken,async(req,res)=>{
    const {user}=req.user;
    try{
        const notes=await Note.find({userId:user._id}).sort({isPinned: -1});
        return res.json({
            error: false,
            notes,
            message:"All notes retrieved successfully"
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({error:true,message:"Server error"});
    }
})
//delete
app.delete('/delete-note/:noteId',authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {user}=req.user;
    try{
        const note=await Note.findOneAndDelete(
            {
                _id:noteId,
                userId:user._id
            }
        )
        if(!note){
            return res
           .status(404).
            json({error:true,message:"Note not found"});
        }
        return res.json({
            error: false,
            message:"Note deleted successfully",
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({error:true,message:"Server error"});
    }
})
//updated isPinned value

app.put('/update-note-pinned/:noteId',authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {isPinned}=req.body;
    const {user}=req.user;
    try{
        const note=await Note.findOne(
            {
                _id:noteId,
                userId:user._id
            }
        )

        if(!note){
            return res
           .status(404).
            json({error:true,message:"Note not found"});
        }
        note.isPinned = isPinned;
        await note.save();
        return res.json({
            error: false,
            message:"Pinned status updated successfully",
            note
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({error:true,message:"Server error"});
    }
})

app.listen(8080);

module.exports =app;