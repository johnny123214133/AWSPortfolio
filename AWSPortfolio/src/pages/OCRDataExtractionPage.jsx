import BidExtractionDashboard from '../OCRDataExtraction/components/BidExtractionDashboard.jsx'
import { BidExtractionProvider } from '../OCRDataExtraction/contexts/BidExtractionContext.jsx'

export default function OCRDataExtractionPage() {
  return (
    <>
      {/*<BidExtractionContext Children={BidExtractionDashboard}/>*/}
      <BidExtractionProvider>
        <BidExtractionDashboard />
      </BidExtractionProvider>
    </>
  )
}