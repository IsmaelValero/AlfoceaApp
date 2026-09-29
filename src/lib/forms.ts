/** Estado que devuelven todas las acciones de formulario de la app. */
export interface FormState {
  error?: string;
}

/** Lee un campo de texto del formulario ya recortado. */
export function text(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim();
}
