import tensorflow_hub as hub
import numpy as np
import os

MODEL_PATH = "./models/universal-sentence-encoder_4.tar.gz"

print(os.path.exists(MODEL_PATH))

if os.path.exists(MODEL_PATH):
    embed = hub.load(MODEL_PATH)
# else:
#     embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")

inpt = input("\nClick enter to proceed: ")

keywords = ["foods", "food engineering", "fruit"]
parameters = ["foods", "Health is the key to success.", "Foiaua Agricultural institute", "Football match organizing"]

keyword_embeddings = embed(keywords)
parameters_embeddings = embed(parameters)

inner = np.inner(keyword_embeddings, parameters_embeddings)
print(inner)