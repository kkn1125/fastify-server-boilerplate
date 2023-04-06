import { TypeORMError } from "typeorm";

export class NotFound extends TypeORMError {}
export class Duplicate extends TypeORMError {}
