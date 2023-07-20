from redash.query_runner import BaseQueryRunner, register
from redash.utils import JSONEncoder, json_dumps

try:
    import neo4j
    import numpy as np
    from neo4j import GraphDatabase
    from neo4j.time import Date, DateTime

    enabled = True
except ImportError:
    enabled = False


class NeoConnection:
    """Utility connector for Neo4J databases."""

    def __init__(self, uri: str, user: str, password: str, database: str = None):
        """Instantiate DB connection"""

        self._conn = GraphDatabase.driver(uri, auth=(user, password))
        self._database = database

    def session(self, **kwargs):
        """Get session instance."""
        return self._conn.session(database=self._database, **kwargs)

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception_value, traceback) -> None:
        if hasattr(self, "_conn"):
            self._conn.close()
        return None


def _is_graph(result):
    out = result.peek()
    if out is None:
        raise ValueError("No results")
    return any(
        isinstance(v, (neo4j.graph.Node, neo4j.graph.Relationship, neo4j.graph.Path))
        for v in out.values()
    )


def _parse_graph(result):
    graph = result.graph()

    out = {
        "nodes": [
            {
                "id": n.element_id,
                "label__": _get_node_label(n),
                "labels__": list(n.labels),
                **n,
            }
            for n in graph.nodes
        ],
        "links": [
            {
                "source": r.start_node.element_id,
                "target": r.end_node.element_id,
                "label__": _get_edge_label(r),
                **r,
            }
            for r in graph.relationships
        ],
    }
    return {
        "columns": [
            {
                "name": "blob",
                "friendly_name": "blob",
            }
        ],
        "rows": [out],
    }


def _get_node_label(node):
    labels = list(node.labels)
    label = labels[0]
    return label


def _get_edge_label(edge):
    return edge.type


def _parse_query(result):
    df = result.to_df()

    data = {"columns": [], "rows": []}
    conversions = [
        {
            "pandas_type": np.integer,
            "redash_type": "integer",
        },
        {
            "pandas_type": np.inexact,
            "redash_type": "float",
        },
        {
            "pandas_type": np.datetime64,
            "redash_type": "datetime",
            "to_redash": lambda x: x.strftime("%Y-%m-%d %H:%M:%S"),
        },
        {"pandas_type": np.bool_, "redash_type": "boolean"},
        {"pandas_type": np.object, "redash_type": "string"},
    ]
    labels = []
    for dtype, label in zip(df.dtypes, df.columns):
        for conversion in conversions:
            if issubclass(dtype.type, conversion["pandas_type"]):
                data["columns"].append(
                    {
                        "name": label,
                        "friendly_name": label,
                        "type": conversion["redash_type"],
                    }
                )
                labels.append(label)
                func = conversion.get("to_redash")
                if func:
                    df[label] = df[label].apply(func)
                break
    data["rows"] = df[labels].replace({np.nan: None}).to_dict(orient="records")
    return data


class Neo4JJSONEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, (Date, DateTime)):
            return super(Neo4JJSONEncoder, self).default(o.to_native())

        return super(Neo4JJSONEncoder, self).default(o)


class Neo4J(BaseQueryRunner):
    should_annotate_query = False

    @classmethod
    def configuration_schema(cls):
        return {
            "type": "object",
            "properties": {
                "uri": {"type": "string"},
                "user": {"type": "string"},
                "password": {"type": "string"},
                "database": {"type": "string", "default": "neo4j"},
            },
            "order": ["uri", "user", "password", "database"],
            "required": ["user", "password", "database"],
            "secret": ["password"],
        }

    @classmethod
    def enabled(cls):
        return enabled

    def run_query(self, query, user):
        try:
            with NeoConnection(
                uri=self.configuration.get("uri"),
                user=self.configuration.get("user"),
                password=self.configuration.get("password"),
                database=self.configuration.get("database"),
            ) as db:
                with db.session(default_access_mode=neo4j.READ_ACCESS) as session:
                    result = session.run(query)

                    if _is_graph(result):
                        out = _parse_graph(result)
                    else:
                        out = _parse_query(result)

                json_data = json_dumps(out, cls=Neo4JJSONEncoder)
        except Exception as ex:
            return None, str(ex)
        return json_data, None

    def get_schema(self, get_stats=False):
        with NeoConnection(
            uri=self.configuration.get("uri"),
            user=self.configuration.get("user"),
            password=self.configuration.get("password"),
            database=self.configuration.get("database"),
        ) as db:
            with db.session() as session:
                nodes = session.run(
                    """
                    CALL db.labels()
                    """
                ).data()
                relationships = session.run(
                    """
                    CALL db.relationshipTypes()
                    """
                ).data()

        return [
            {"name": "Labels", "columns": [x["label"] for x in nodes]},
            {
                "name": "Relationships",
                "columns": [x["relationshipType"] for x in relationships],
            },
        ]


register(Neo4J)
