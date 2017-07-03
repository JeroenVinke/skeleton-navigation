export class Cache {
  get<T>(key: any): T {
    throw new Error('Cache implementation should implement get()');
  }
  
  set(key: any, value: any, cacheStrategy?: ICachingStrategy) {
    throw new Error('Cache implementation should implement set()');
  }
}

export interface ICachingStrategy {
  hasExpired(): boolean;
}

export class TimeCachingStrategy implements ICachingStrategy {
  expires: Date;

  constructor(expires) {
    this.expires = expires;
  }

  hasExpired() {
    return new Date() > this.expires;
  }
}

export class NoExpireCachingStrategy {
  hasExpired() {
    return false;
  }
}

export class NoCachingStrategy {
  hasExpired() {
    return true;
  }
}