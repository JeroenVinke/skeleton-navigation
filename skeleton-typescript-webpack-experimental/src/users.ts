import {inject, Lazy} from 'aurelia-framework';
import {Cache} from '../cache/aurelia-cache';
import {HttpClient} from 'aurelia-fetch-client';

// polyfill fetch client conditionally
const fetch = !self.fetch ? System.import('isomorphic-fetch') : Promise.resolve(self.fetch);
const usersCacheKey = 'users:github_users';

interface IUser {
  avatar_url: string;
  login: string;
  html_url: string;
}

@inject(Lazy.of(HttpClient), Cache)
export class Users {
  heading: string = 'Github Users';
  users: Array<IUser> = [];
  http: HttpClient;
  /**
   * ref element on the binding-context
   */
  image: HTMLImageElement;

  constructor(private getHttpClient: () => HttpClient, private cache: Cache) {}

  async activate(): Promise<void> {
    let cachedUsers = this.cache.get<IUser[]>(usersCacheKey)

    if (cachedUsers) {
      this.users = cachedUsers;
      return;
    }

    // ensure fetch is polyfilled before we create the http client
    await fetch;
    const http = this.http = this.getHttpClient();

    http.configure(config => {
      config
        .useStandardConfiguration()
        .withBaseUrl('https://api.github.com/');
    });

    const response = await http.fetch('users');
    this.users = await response.json();

    this.cache.set(usersCacheKey, this.users);
  }
}
