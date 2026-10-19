import { useEffect, useState } from 'react';
import { masterDataApi } from '../../../api';
import { InspectionChecklistItem } from '../../survey/types';
import { QCCheckItem } from '../../qc/types/qc';

// Checklist giám định (vùng IICL-6) và checklist nghiệm thu QC — danh mục DB (catalog SURVEY_CHECKLIST /
// QC_CHECKLIST, seed ở DbSeeder.SeedCatalogsAsync). Trước đây là 2 mảng gõ cứng ở frontend
// (survey/mockData.ts, qc/data/defaultQCChecklist.ts).

const readJson = (value: unknown): Record<string, any> => {
  try { return JSON.parse(String(value || '{}')); } catch { return {}; }
};

let surveyCache: Promise<InspectionChecklistItem[]> | null = null;
let qcCache: Promise<QCCheckItem[]> | null = null;

export const fetchSurveyChecklistTemplate = (): Promise<InspectionChecklistItem[]> => {
  surveyCache ??= masterDataApi.getCatalog('SURVEY_CHECKLIST')
    .then((res: any) => (res?.data || []).map((item: any) => ({
      zoneKey: item.code,
      zoneName: item.nameVi || item.name,
      status: readJson(item.jsonData).defaultStatus || 'PASS',
      damageCount: 0
    }) as InspectionChecklistItem))
    .catch(() => { surveyCache = null; return []; });
  return surveyCache;
};

// Màn "DM Khu Vực Checklist Giám Định" gọi sau mỗi lần thêm / sửa / tạm ngưng / xoá: bỏ cache và báo các màn đang mở
// (DM Vị Trí Cấu Kiện, Thêm mới giám định...) tải lại danh mục mà không cần F5.
export const SURVEY_CHECKLIST_CHANGED_EVENT = 'survey-checklist-changed';
export const resetSurveyChecklistCache = () => {
  surveyCache = null;
  window.dispatchEvent(new Event(SURVEY_CHECKLIST_CHANGED_EVENT));
};

export const fetchQcChecklistTemplate = (): Promise<QCCheckItem[]> => {
  qcCache ??= masterDataApi.getCatalog('QC_CHECKLIST')
    .then((res: any) => (res?.data || []).map((item: any) => ({
      id: item.code,
      category: readJson(item.jsonData).category || 'STRUCTURE',
      titleVi: item.nameVi || item.name,
      standardVi: item.description || '',
      isPassed: true
    }) as QCCheckItem))
    .catch(() => { qcCache = null; return []; });
  return qcCache;
};

/** Bản sao checklist giám định mẫu; mảng rỗng cho tới khi tải xong. */
export const useSurveyChecklistTemplate = (): InspectionChecklistItem[] => {
  const [items, setItems] = useState<InspectionChecklistItem[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () => fetchSurveyChecklistTemplate().then((list) => { if (alive) setItems(list); });
    load();
    window.addEventListener(SURVEY_CHECKLIST_CHANGED_EVENT, load);
    return () => { alive = false; window.removeEventListener(SURVEY_CHECKLIST_CHANGED_EVENT, load); };
  }, []);
  return items;
};

/** Checklist nghiệm thu QC mẫu; mảng rỗng cho tới khi tải xong. */
export const useQcChecklistTemplate = (): QCCheckItem[] => {
  const [items, setItems] = useState<QCCheckItem[]>([]);
  useEffect(() => {
    let alive = true;
    fetchQcChecklistTemplate().then((list) => { if (alive) setItems(list); });
    return () => { alive = false; };
  }, []);
  return items;
};
