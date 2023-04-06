import axios from "axios";
import type { Repository } from "typeorm";
import User from "../entity/User";
import { dev } from "../util/tool";

export class UserService {
  constructor(public repository: Repository<User>) {
    this.repository = repository;
  }

  findAll(queryParse?: string) {
    return;
  }

  findOne({ id }: { id?: string } = {}) {
    return;
  }

  insert(body?: User) {
    return;
  }

  update(id?: string, options?: User) {
    return;
  }

  delete(options: { id?: string } = {}) {
    return;
  }
}
