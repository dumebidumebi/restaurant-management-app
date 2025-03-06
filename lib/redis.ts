import {Redis} from "ioredis"
// import { Redis } from '@upstash/redis';

const getRedisUrl = () =>{
    if(process.env.REDIS_URL){
        return process.env.REDIS_URL
    }

    throw new Error("Redis url not defined")
}

export const redis = new Redis(getRedisUrl())

// export const redis = new Redis({
//     url: process.env.UPSTASH_REDIS_REST_URL!,
//     token: process.env.UPSTASH_REDIS_REST_TOKEN!,
//   });