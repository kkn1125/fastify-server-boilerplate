import axios from "axios";
import { Like, Repository } from "typeorm";
import User from "../entity/User";
import { WhereType } from "../types/types";
import { dev } from "../util/tool";

export class UserService {
  constructor(public repository: Repository<User>) {
    this.repository = repository;
  }

  findAll(
    skip: number,
    limit: number,
    exact: boolean,
    where: { [key: string]: any }
  ) {
    if (!exact && where && Object.keys(where).length > 0) {
      Object.keys(where).forEach((key) => {
        where[key] = Like(`%${where[key]}%`);
      });
    }
    return this.repository.find({
      skip: limit * skip - limit,
      take: limit,
      where: where as WhereType<User>,
      select: Object.fromEntries(
        Object.keys(new User())
          .filter((key) => key !== "password")
          .map((key) => [key, true])
      ),
    });
  }

  findOne(id: number | string) {
    return this.repository.findOne({
      where: { id: id } as unknown as WhereType<User>,
    });
  }

  findOneByUserId(userId: string) {
    return this.repository.find({
      where: { user_id: userId } as unknown as WhereType<User>,
    });
  }

  async insert(bodies: User) {
    await this.repository.insert(bodies);
  }

  async update(id: number | string, bodies: User) {
    await this.repository.update({ id: id } as any, bodies);
  }

  async delete(id: number | string) {
    await this.repository.delete({ id: id } as any);
  }

  async paginations(
    skip: number,
    limit: number,
    exact: boolean,
    where: { [key: string]: any }
  ) {
    if (!exact && where && Object.keys(where).length > 0) {
      Object.keys(where).forEach((key) => {
        where[key] = Like(`%${where[key]}%`);
      });
    }

    const total_record = await this.repository.count({
      skip: limit * skip - limit,
      take: limit,
      where: where as WhereType<User>,
    });

    const current_page = skip;
    const total_page = limit === 0 ? 1 : Math.ceil(total_record / limit) || 1;
    return {
      limit: Number(limit),
      total_record,
      current_page,
      total_page,
    };
  }
}
