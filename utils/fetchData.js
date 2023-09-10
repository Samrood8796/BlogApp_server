import Post from "../models/Post.js";

export const fetchFindByIdData =async (id,data)=>{
    const post=await Post.findById(id,data)
      .populate("author", "userName imagePath")
      .populate("comments.author", "userName imagePath")
      .sort({ createdAt: -1 })
      .exec();
      return post
}
export const fetchFindData =async (data)=>{
    const post = await Post.find(data)
      .populate("author", "userName imagePath")
      .populate("comments.author")
      .sort({ createdAt: -1 })
      .exec();

      return post
}