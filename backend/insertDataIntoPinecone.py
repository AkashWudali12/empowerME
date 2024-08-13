from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os

import itertools
import time
import tqdm
from sentence_transformers import SentenceTransformer
from pprint import pprint

import json
import os

load_dotenv()

api_key = os.getenv("PINECONE_API_KEY")

pc = Pinecone(api_key=api_key)
index = pc.Index("empower-me")

# this method is more memory efficient that regular for loop since it only acces memory in chunks as needed

def generateEmbeddings(embeddingString):
    model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
    embeddings = model.encode([embeddingString])
    return embeddings[0]

def databaseBatchInsert(dct, batchSize, namespace):
    it = iter(dct.keys())
    chunk = itertools.islice(it, batchSize)
    while chunk:
        try:
            vectors = []
            for key in chunk:
                response = index.fetch(ids=[key], namespace=namespace)
                if not key in response.vectors:
                    embedding = generateEmbeddings(dct[key]["embeddingString"])
                    vectors.append({"id":key, "values":embedding, "metadata":{"id": key, "info":json.dumps(dct[key]["basicInfo"])}})
                    index.upsert(vectors, namespace=namespace)
                    print("Successfully Added Vector")
                else:
                    print("Vector already in database")
        except Exception as e:
            print(e)
            print("Failed to add vector")
        chunk = itertools.islice(it, batchSize)

filepath = "parsedEhrData/"

print(os.listdir(filepath))

data = []
for pfile in os.listdir(filepath):   
    with open(filepath + pfile, 'r') as file:
        namespace = pfile.replace(".json", "")
        data.append((namespace, json.load(file)))

# had to manually change for each idx

for namespace, dct in data[2:]:
    print(namespace)
    databaseBatchInsert(dct, 100, namespace)