# backend/ai.py
import os
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

from transformers import pipeline
import dateparser 
from dateparser.search import search_dates

# 全局变量
classifier_scene = None
classifier_object = None
extractor_ner = None

def load_models():
    global classifier_scene, classifier_object, extractor_ner
    print("🤖 正在加载 AI 混合引擎...")
    try:
        # 1. 视觉模型
        if classifier_scene is None:
            print("   - [1/3] Loading Scene Model...")
            classifier_scene = pipeline("image-classification", model="google/vit-base-patch16-224")
        if classifier_object is None:
            print("   - [2/3] Loading Object Model...")
            classifier_object = pipeline("object-detection", model="facebook/detr-resnet-50")
        
        # 2. 文本模型
        if extractor_ner is None:
            print("   - [3/3] Loading Text NER Model...")
            extractor_ner = pipeline("token-classification", model="uer/roberta-base-finetuned-cluener2020-chinese")
            
        print("✅ AI 引擎加载完成！")
    except Exception as e:
        print(f"❌ 模型加载失败: {e}")

def analyze_image(image_path):
    """视觉分析 (保持不变)"""
    global classifier_scene, classifier_object
    if classifier_scene is None: load_models()
    if classifier_scene is None: return None

    final_tags = set()
    try:
        res_scene = classifier_scene(image_path)
        if res_scene:
            final_tags.add(res_scene[0]['label'].split(',')[0].lower())
        res_objects = classifier_object(image_path)
        for obj in res_objects:
            if obj['score'] > 0.9:
                final_tags.add(obj['label'].lower())
        return ", ".join(list(final_tags))
    except Exception as e:
        return None

def analyze_text(text):
    """
    升级版文本分析：
    1. 使用 dateparser 强力解析时间
    2. 使用 NER 提取地点 (放宽限制)
    """
    global extractor_ner
    if extractor_ner is None: load_models()
    
    extracted = {"location": None, "date": None}
    if not text: return extracted
    
    # --- 1. 强力时间解析 (优先使用 dateparser) ---
    try:
        # search_dates 会自动从句子里找时间，返回 [(字符串, datetime对象), ...]
        # settings={'PREFER_DATES_FROM': 'future'} 也可以设置，这里用默认
        dates = search_dates(text, languages=['zh'])
        if dates:
            # 取第一个找到的时间
            print(f"⏰ 解析到时间: {dates[0]}")
            extracted['date'] = dates[0][1] # 直接拿到 datetime 对象
    except Exception as e:
        print(f"时间解析失败: {e}")

    # --- 2. 地点提取 (NER) ---
    if extractor_ner:
        try:
            results = extractor_ner(text, aggregation_strategy="simple")
            loc_fragments = []
            
            for entity in results:
                # 只要是 地点(LOC)、地址(address)、机构(ORG) 都算进去
                # 即使是单字（如“省”）也不过滤了，防止信息丢失
                if entity['entity_group'] in ['LOC', 'address', 'ORG']:
                    loc_fragments.append(entity['word'])
            
            # 简单的拼接，不去重（因为有时候“浙江”和“大学”可能分开识别，去重会乱）
            if loc_fragments:
                extracted['location'] = "".join(loc_fragments)
                
        except Exception as e:
            print(f"地点解析失败: {e}")
            
    return extracted