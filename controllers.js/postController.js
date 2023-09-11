import Post from "../models/Post.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import {
  fetchFindByIdData,
  fetchFindData,
} from "../utils/fetchData.js";

/* Create post */
export const createPost = async (req, res) => {
  try {
    const { title, explanation } = req.body;
    const { id } = req.user;

    let post = {
      content: title,
      explanation,
      author: id,
      likes: {},
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Posts",
      });
      post.image = result.secure_url;
      post.imagePublicId= result.public_id ;
    }

    const newPost = new Post(post);
    const savedPost = await newPost.save();
    const populatedPost = await fetchFindByIdData(savedPost._id, {
      isDelete: false,
    });

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};



export const getFeedPosts = async (req, res) => {
  try {
    const posts = await fetchFindData({ isDelete: false });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await fetchFindData({ author: userId, isDelete: false });

    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


export const likePost = async (req, res) => {
    try {
        const { id } = req.user
        const { postId } = req.params
        const post = await Post.findById(postId)
        if (!post) return res.status(400).json('post not found')

        const isliked = post.likes.get(id)

        if (isliked) {
            post.likes.delete(id)
        } else {
            post.likes.set(id, true)
        }
        await post.save()
        const updatedPost = await Post.findById(postId).populate('author comments.author')
        return res.status(200).json(updatedPost)
    } catch (err) {
        console.log(err);
        return res.status(500).json('internal error occured')
    }
}

// add comment
export const postComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const {id}  = req.user
    console.log(id);
    const { comment} = req.body;
    const post = await Post.findById(postId);
    post.comments.unshift({ coment: comment, author: id });
    const savedPost = await post.save();
    const populatedPost = await fetchFindByIdData(savedPost._id, {
      isDelete: false,
    });
    res.status(200).json(populatedPost); 
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByIdAndUpdate(postId, { isDelete: true }, { new: true });
    // const post = await Post.findById(postId);
    const { imagePublicId } = post
    console.log("==>",post);
    console.log("==",imagePublicId);
    // deleting from cloudinary
    cloudinary.uploader.destroy(imagePublicId, (error, result) => {
        if (error) {
            console.log('Error deleting image:', error.message);
        } else {
            console.log('Image deleted successfully');
        }
    }); 
    res.status(200).json({id:postId});
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
