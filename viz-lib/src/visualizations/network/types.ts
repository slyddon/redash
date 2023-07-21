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

type EntityProperties = {
  [index: string]: any;
};

export interface NodeType {
  id: string;
  label: string;
  labels: Array<string>;
  properties: EntityProperties;

  x: number;
  y: number;
  radius: number;
  color: string;
  captionKey: string;
  caption: any;
}

export interface LinkType {
  source: string;
  target: string;
  label: string;
  properties: EntityProperties;

  color: string;
  strokeWidth: number;
}

export interface GraphType {
  nodes: Array<NodeType>;
  links: Array<LinkType>;
}
