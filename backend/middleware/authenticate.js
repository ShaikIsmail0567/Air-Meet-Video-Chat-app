const {client}=require("../config/redis");
require("dotenv").config();
const jwt=require("jsonwebtoken");

const auth=async(req,res,next)=>{
    try{
        let token=await client.get("token");
        // if token is not expired
        if(token){
            // if token is blacklisted or not
            let ind=await client.lPos("blackListedTokens",token);
            if(ind){
                res.send("log in first");
            }else{
                // if token is valid or not
                jwt.verify(token,process.env.JWT_TOKEN,async(err,decode)=>{
                    if(decode){
                        req.body.userId=decode.userId;
                        next();
                    }else{
                        // getting refresh token from client(redis)
                        let refreshToken=await client.get("refreshToken");
                        // checking if refresh token is valid or not
                        jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN,async(err,decoded)=>{
                            // if expired
                            if(err) res.send({"error":err.message});
                            // if valid, creating new noremal token and setting up in client(redis)
                            if(decoded){
                                let userId=decoded.userId;
                                let token=jwt.sign(userId,process.env.JWT_TOKEN);
                                await client.set("token",token);
                                next();
                            }
                        })
                    }
                })
            }
        }else{
            // getting refresh token from client(redis)
            let refreshToken=await client.get("refreshToken");
            // checking if refresh token is valid or not
            if(refreshToken){
                // check if present in blacklisted
                let ind=await client.lPos("blackListedTokens",refreshToken);
                if(ind){
                    res.send("login please");
                }else{
                    jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN,async(err,decoded)=>{
                        if(decoded){
                            userId=decoded.userId;
                            let token=jwt.sign({"userId":userId},process.env.JWT_TOKEN);
                            await client.set("token",token);
                            req.body.userId=userId;
                            next();
                        }else{
                            res.send("login again");
                        }
                    })
                }
            }else{
                res.send("log in please");
            }
        }
    }catch(err){
        res.send({"error":err.message});
    }
}

module.exports={
    auth
}