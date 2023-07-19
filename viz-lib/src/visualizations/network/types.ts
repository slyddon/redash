interface ObjectOptions {
  strokeWidth: number;
  color: string;
  radius: number;
  label: string | null;
  [index: string]: any;
}

export interface NetworkOptionsType {
  centreAttraction: number;
  chargeStrength: number;
  linkStrength: number;
  collisionRadius: number;
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
  label__: string;
}

export interface Link {
  source: string;
  target: string;
  label__: string;
}
