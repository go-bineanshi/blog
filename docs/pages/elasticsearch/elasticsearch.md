# Elasticsearch

## 一. 组件

### 1.1 索引 (index) (数据库)

是一个包含了相关文档数据的集合，存数据的地方。索引可以包含多个类型 (type)，每个类型代表一个类似数据库中的表。

#### 1.1.1 创建

```bash
# 1. 创建默认索引
- PUT /索引名  ====> PUT /products
- 注意：
    1. ES 中索引健康状态  red(索引不可用),yellwo(索引可用,存在风险),green(健康)
    2. 默认ES在创建索引时会默认创建1个主分片和1个副本分片

# 2. 创建索引 进行索引分片配置
- PUT /索引名
{
    "settings": {
        "number_of_shards": 1,  # 主分片
        "number_of_replicas": 0 # 副本分片
    }
}
```

### 1.2 类型 (type) (表)

用来定义数据结构，是在索引中对文档进行分类的一种方式。每个类型都有自己的映射(Mapping),定义了文档中包含的字段和他们的类型。

### 1.3 文档 (document) (行)

是存储在索引(index)中的基本数据单位(最小)，一个文档就是一条记录。类似于 Mysql 中的一行。每个文档都是一个 JSON 格式的数据对象，它包含了实际的数据

### 1.4 字段 (field) (列)

一个 document 由多个 field 组成，每个 field 都有一个名称和值，一个 field 就是一个列。

### 1.5 映射 (mapping) (表结构定义)

每个索引都有一个对象的 Mapping。主要用于定义文档中的字段类型和属性，以及索引文档时自动检测字段类型并创建 Mapping

- 字符串类型: keyword 关键字 关键词、 text 文本
- 数字类型: integer long
- 小数类型: float double
- 日期类型: date
- 布尔类型: boolean

## 二. 分布式架构

它允许数据存储和处理在多个节点上分布，并能够处理大规模的数据量

- 节点(node): 每个节点是一个独立的 Elasticsearch 实例，可以运行在单独的服务器上，也可以在同一台物理服务器上运行多个节点
- 集群(Cluster): 一个或多个节点可以组成一个 Elasticsearch 集群，他们共享数据和协调任务。单个节点只能属于一个集群
- 分片(Shard): 将数据分成多个分片，每个分片是一个独立的索引单元，包含索引的一部分数据。分片可以分布在不同的节点上，是的数据能够水平扩展
- 副本(Replica): 每个分片可以有零个或多个副本，副本是分片的拷贝。副本提供了数据的冗余备份和容错机制，并能够提高搜索性能。
- Master 节点: 集群中有一个或多个节点被选举为主节点(Master node),主节点负责集群范围内的管理任务，如创建和删除索引、分片的分配等
- 协调节点(Coordinator Node): 在搜索请求到达时，协调节点负责协调请求的路由和分发。它不存储数据，专注于请求的转发。
- 数据节点(Data Node): 负责存储数据的节点，他们承载索引分片和处理搜索请求。

## 三. 倒排索引

倒排索引的基本原理是，对于每个文档，遍历文档中的每个单词，将单词与包含该单词的文档进行关联。这样就可以快速地根据单词来查找包含该单词的文档列表，倒排索引时通过词项词典和倒排列表来实现的：

### 3.1 词项词典

包含了所有文档中出现过的单词+指向倒排列表的指针。

### 3.2 倒排列表

包含了每个单词的文档 ID 列表+文档中的位置等信息

使用倒排索引进行数据检索的步骤如下：
1）创建索引：首先需要将数据存储到 Elasticsearch 中，并创建相应的索引
2）插入文档：将文档插入到索引中，Elasticsearch 会自动构建倒排索引
3）查询数据：用户提交查询请求时，Elasticsearch 会对查询词项进行分析和标准化，然后通过倒排索引定位包含这些词项的文档，并返回查询结果

## 四. 存储原理

是基于倒排索引和分布式存储的结合，使得他能够高效地存储和检索大规模的数据。
倒排索引时一种数据结构，它将文档中的每个词条与其出现的位置进行关联，从而可以快速地进行全文检索。数据被分片存储在多个节点上，每个节点都有自己的倒排索引。当索引一个文档时，Elasticsearch 会将文档分割成多个词条，并将每个词条存储在相应的倒排索引中

## 五. 存储步骤

1） 创建索引
在 Elasticsearch 中，数据存储在索引(表)中(文档存储在索引中)。要存储数据，首先要创建一个索引
2） 定义映射
在创建索引时，通常需要定义数据的映射。映射定义了索引中的字段以及他们的数据类型。
3） 索引文档
一旦索引和映射定义好了，就可以开始将文档存储到 Elasticsearch 中。文档是实际存储的数据记录。他们以 JSON 格式表示，并被存储在索引中。

## 六. 基础使用

### 6.1 索引

#### 6.1.1 创建索引&映射

```
PUT /products
{
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0
    },
    "mappings": {
        "properties": {
            "title": {
                "type": "keyword"
            },
            "price": {
                "type": "double"
            },
            "created_at": {
                "type": "date",
            },
            "description": {
                "type": "text"
            }
        }
    }
}
```

![create](https://blog.qiniu.g-bill.club/blog/202405061048408.png)

PS: 支持[字段类型](https://www.elastic.co/guide/en/elasticsearch/reference/7.15/mapping-types.html)

#### 6.1.2 查询

```
# 查询索引
- GET /_cat/indices?v
```

![cat_indices](https://blog.qiniu.g-bill.club/blog/202405061050950.png)

```
# 查看某个索引的映射
- GET /索引名/_mapping   =====> GET /products/_mapping
```

![index_mapping](https://blog.qiniu.g-bill.club/blog/202405061051600.png)

#### 6.1.3 删除

```
# 删除索引
- DELETE /索引名 =====> DELETE /products

- DELETE /*  # *代表通配符，代表所有索引，删除所有索引
```

![delete_index](https://blog.qiniu.g-bill.club/blog/202405061052118.png)

### 6.2 文档

#### 6.2.1 添加

```
- POST /索引名/_doc/1   =====> POST /products/_doc/1 #指定文档ID
{
  "title":"iphone13",
  "price":8999.99,
  "created_at":"2021-09-15",
  "description":"iPhone 13屏幕采用6.1英寸OLED屏幕。"
}
```

```
- POST /索引名/_doc   =====> POST /products/_doc/ #自动生成文档ID
{
  "title":"iphone14",
  "price":8999.99,
  "created_at":"2021-09-15",
  "description":"iPhone 13屏幕采用6.8英寸OLED屏幕"
}
```

返回：

```
{
  "_index" : "products",
  "_type" : "_doc",
  "_id" : "sjfYnXwBVVbJgt24PlVU",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 3,
  "_primary_term" : 1
}
```

#### 6.2.2 查询文档

```
GET /products/_doc/1

# 返回
{
  "_index" : "products",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "title" : "iphone13",
    "price" : 8999.99,
    "created_at" : "2021-09-15",
    "description" : "iPhone 13屏幕采用6.1英寸OLED屏幕"
  }
}
```

#### 6.2.3 删除文档

```
DELETE /products/_doc/1

# 返回:
{
  "_index" : "products",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 2,
  "result" : "deleted",
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 2,
  "_primary_term" : 1
}
```

#### 6.2.4 更新文档

```
PUT /products/_doc/sjfYnXwBVVbJgt24PlVU
{
  "title":"iphon15"
}
```

> 说明： 这种更新方式是先删除原始文档，再将更新文档以新的内容插入

```
POST /products/_doc/sjfYnXwBVVbJgt24PlVU/_update
{
    "doc":{
        "title":"iphon15"
    }
}
```

> 说明： 这种方式可以将数据原始内容保存，并在此基础上更新

#### 6.2.5 批量操作

```
POST /products/_doc/_bulk # 批量索引两条文档
{"index":{"_id":"1"}}
{"title":"iphone14","price":8999.99,"created_at":"2021-09-15","description":"iPhone 13屏幕采用6.8英寸OLED屏幕"}
{"index":{"_id":"2"}}
{"title":"iphone15","price":8999.99,"created_at":"2021-09-15","description":"iPhone 15屏幕采用10.8英寸OLED屏幕"}

```

```
POST /products/_doc/_bulk #更新文档同时删除文档
{"update":{"_id":"1"}}
{"doc":{"title":"iphone17"}}
{"delete":{"_id":2}}
{"index":{}}
{"title":"iphone19","price":8999.99,"created_at":"2021-09-15","description":"iPhone 19 屏幕采用 61.8 英寸 OLED 屏幕"}
```

> 说明： 批量时不会因为一个失败而全部失败，而是继续执行后续操作，在返回时按照执行的状态返回

## 七. 高级查询

ES 中提供了一种强大的检索数据方式，这种检索方式称之为 Query DSL，Query DSL 是利用 Rest Api 传递 JSON 格式的请求体(Request Body)数据与 ES 进行交互，这种方式的丰富查询语法让 ES 检索变得更强大，更简洁

### 7.1 语法

```
GET /索引名/_doc/_search {json格式请数据}
GET /索引名/_search {json格式请数据}
```

### 7.2 测试数据

```
# 1.创建索引 映射
PUT /products/
{
  "mappings": {
    "properties": {
      "title":{
        "type": "keyword"
      },
      "price":{
        "type": "double"
      },
      "created_at":{
        "type":"date"
      },
      "description":{
        "type":"text"
      }
    }
  }
}
# 2.测试数据
PUT /products/_doc/_bulk
{"index":{}}
  {"title":"iphone12 pro","price":8999,"created_at":"2020-10-23","description":"iPhone 12 Pro采用超瓷晶面板和亚光质感玻璃背板，搭配不锈钢边框，有银色、石墨色、金色、海蓝色四种颜色。宽度:71.5毫米，高度:146.7毫米，厚度:7.4毫米，重量：187克"}
{"index":{}}
  {"title":"iphone12","price":4999,"created_at":"2020-10-23","description":"iPhone 12 高度：146.7毫米；宽度：71.5毫米；厚度：7.4毫米；重量：162克（5.73盎司） [5]  。iPhone 12设计采用了离子玻璃，以及7000系列铝金属外壳。"}
{"index":{}}
  {"title":"iphone13","price":6000,"created_at":"2021-09-15","description":"iPhone 13屏幕采用6.1英寸OLED屏幕；高度约146.7毫米，宽度约71.5毫米，厚度约7.65毫米，重量约173克。"}
{"index":{}}
  {"title":"iphone13 pro","price":8999,"created_at":"2021-09-15","description":"iPhone 13Pro搭载A15 Bionic芯片，拥有四种配色，支持5G。有128G、256G、512G、1T可选，售价为999美元起。"}
```

### 7.3 常见检索

#### 7.3.1 查询所有 [match_all]

> match_all 关键字： 返回索引中的全部文档

```
GET /product/_search
{
    "query": {
        "match_all": {}
    }
}
```

#### 7.3.2 关键词查询 [term]

> term 关键字: 用来使用关键词查询

```
GET /product/\_search
{
    "query": {
        "term": {
            "price": {
                "value": 4999
            }
        }
    }
}
```

NOTE1: 通过使用 term 查询得知 ES 中默认使用分词器为标准分词器(StandardAnalyzer)，标准分词器对于单词分词，对于中文单字分词
NOTE2: 通过使用 term 查询得知， 在 ES 的 Mapping Type 中，keyword,date,integer,long,double,boolean or ip 这些类型不分词，只有 text 类型分词

#### 7.3.3 范围查询 [range]

range 关键字： 用来指定查询指定范围内的文档

```
GET /products/_search
{
    "query": {
        "range": {
            "price": {
                "gte": 100,
                "lte": 200
            }
        }
    }
}
```

#### 7.3.4 前缀查询 [prefix]

prefix 关键字：用来指定查询指定前缀的文档

```
GET /products/_search
{
    "query": {
        "prefix": {
            "title": {
                "value": "iPhone"
            }
        }
    }
}
```

#### 7.3.5 通配符查询 [wildcard]

wildcard 关键字：通配符查询？用来匹配一个任意字符 \*用来匹配多个任意字符

```
GET /products/_search
{
    "query": {
        "wildcard": {
            "description": {
                "value": "iphon*"
            }
        }
    }
}
```

#### 7.3.6 多 ID 查询 [ids]

ids 关键字： 值为数组类型，用来根据一组 id 获取多个对应的文档

```
GET /products/_search
{
    "query": {
        "ids": {
            "values": [
                "verUq3wBOTjuBizqAegi",
                "vurUq3wBOTjuBizqAegk"
            ]
        }
    }
}
```

#### 7.3.7 模糊查询 [fuzzy]

fuzzy 关键字： 用来模糊查询指定关键字的文档

```
GET /products/_search
{
    "query": {
        "fuzzy": {
            "description": "手机"
        }
    }
}
```

注意： fuzzy 模糊查询 最大模糊词 必须在 0-2 之间

1. 搜索关键词长度为 2 不允许存在模糊
2. 搜索关键词长度为 3-5 允许一次模糊
3. 搜索关键词长度大于 5 允许最大 2 次模糊

#### 7.3.8 布尔查询 [bool]

1. bool 关键字：用来组合多个条件实现复杂查询
2. must: 相当于 && 同时成立
3. should: 相当于 || 满足一个即可
4. must_not: 相当于 ! 不成立

```
GET /products/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "term": {
                        "price": {
                            "value": 4999
                        }
                    }
                }
            ]
        }
    }
}
```

#### 7.3.9 多字段查询 [multi_match]

```
GET /products/_search
{
    "query": {
        "multi_match": {
            "query": "小米",
            "fields": ["title", "description"]
        }
    }
}
```

注意： 字段类型分词，将查询条件分词之后进行查询该字段，如果该字段不分词就会将查询条件作为整体进行查询

#### 7.3.10 默认字段分词查询 [query_string]

```
GET /products/_search
{
    "query": {
        "query_string": {
            "default_field": "description",
            "query": "elasticsearch"
        }
    }
}
```

注意：查询该字段分词就将查询条件分词查询，查询字段不分词将查询条件不分词查询

#### 7.3.11 高亮查询 [highlight]

1. highlight 关键字: 可以让符合条件的文档中的关键字高亮

```
GET /products/_search
{
    "query": {
        "term": {
            "description": {
                "value": "elasticsearch"
            }
        }
    },
    "highlight": {
        "fields": {
            "*": {}
        }
    }
}
```

2. 自定义高亮 html 标签: 可以在 highlight 中使用 pre_tags 和 post_tags

```
GET /products/_search
{
    "query": {
        "term": {
            "description": {
                "value": "elasticsearch"
            }
        }
    },
    "highlight": {
        "fields": {
            "*": {}
        },
        "pre_tags": ["<span style='color:red'>"],
        "post_tags": ["</span>"]
    }
}
```

3. 多字段高亮 使用 require_field_match 开启多个字段高亮

```
GET /products/_search
{
    "query": {
        "term": {
            "description": {
                "value": "elasticsearch"
            }
        }
    },
    "highlight": {
        "fields": {
            "*": {}
        },
        "require_field_match": false,
        "pre_tags": ["<span style='color:red'>"],
        "post_tags": ["</span>"]
    }
}
```

#### 7.3.12 返回指定条数 [size]

size: 指定查询结果返回指定条数。 默认返回值 10 条。

```
GET /products/_search
{
    "query": {
        "match_all": {}
    },
    "size": 5
}
```

#### 7.3.13 分页查询 [from]

from: 指定查询结果返回的起始位置,和 size 关键字连用可实现分页效果。

```
GET /products/_search
{
    "query": {
        "match_all": {}
    },
    "from": 10,
    "size": 5
}
```

#### 7.3.14 排序 [sort]

sort: 指定排序字段，默认升序，可以指定排序方式。

```
GET /products/_search
{
    "query": {
        "match_all": {}
    },
    "sort": [
        {
            "price": {
                "order": "desc"
            }
        }
    ]
}
```

#### 7.3.15 返回指定字段 [_source]

\_source: 指定返回的字段，默认返回全部字段。

```
GET /products/_search
{
    "query": {
        "match_all": {}
    },
    "_source": ["title", "price"]
}
```
