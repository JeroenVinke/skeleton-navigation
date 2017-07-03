import {TimeCachingStrategy, ICachingStrategy} from '../cache/aurelia-cache';

export class CacheNode {
  cache = {};

  get<T>(key: any): T {
    let entry = this.cache[key];

    if (entry && !entry.cacheStrategy.hasExpired()) {
      return entry.value;
    }

    return null;
  }

  set(key: any, value: any, cacheStrategy: ICachingStrategy) {
    if (!cacheStrategy) {
      let today = new Date();
      cacheStrategy = new TimeCachingStrategy(today.setHours(today.getHours() + 1));
    }

    this.cache[key] = {
      value: value,
      cacheStrategy: cacheStrategy
    };
  }
}