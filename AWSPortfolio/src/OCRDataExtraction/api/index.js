import axios from "axios";

const api = axios.create({
  baseURL : import.meta.env.VITE_OCR_API_URL
})

/**
 * Sends the uploaded PDF to the Flask backend's extract_bids_json()
 * endpoint as multipart/form-data and returns the parsed
 * { metadata, bid_summaries, line_items } payload.
 *
 * Deliberately NOT setting a Content-Type header by hand here -- when
 * axios is given a FormData body in the browser, it sets
 * multipart/form-data with the correct boundary itself. Setting the
 * header manually without a boundary is a common way to break the
 * upload.
 */
export async function extractBidsFromPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  console.log(import.meta.env.VITE_OCR_API_URL)

  // const response = await axios.post(OCR_ENDPOINT, formData);
  const response = await api.post(`/api/ocr`, formData);
  return response.data;
}
