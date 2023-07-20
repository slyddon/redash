interface ObjectOptions {
  strokeWidth: number;
  color: string;
  radius: number;
  label: string | null;
  [index: string]: any;
}

export interface NetworkOptionsType {
  objectOptions: { [index: string]: ObjectOptions };
}

export interface NetworkDataType {
  columns: {
    name: string;
    friendly_name: string;
  }[];

  rows: any[];
}

export interface Node {
  id: string;
  x: number;
  y: number;
  label__: string;
  labels__: Array<string>;
}

export interface Link {
  source: string;
  target: string;
  label__: string;
}
