import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FDAService {
  private readonly logger = new Logger(FDAService.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.FDA_API_URL || 'https://api.fda.gov';
    this.logger.log('FDA Service initialized - FREE API, no key needed!');
  }

  /**
   * Search for drug information
   * FREE - No API key needed!
   */
  async searchDrug(drugName: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`FDA API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      const drug = data.results[0];

      return {
        brandName: drug.openfda?.brand_name?.[0],
        genericName: drug.openfda?.generic_name?.[0],
        manufacturer: drug.openfda?.manufacturer_name?.[0],
        purpose: drug.purpose?.[0],
        warnings: drug.warnings?.[0],
        dosage: drug.dosage_and_administration?.[0],
        sideEffects: drug.adverse_reactions?.[0],
        interactions: drug.drug_interactions?.[0],
        activeIngredient: drug.active_ingredient?.[0],
      };
    } catch (error) {
      this.logger.error(`Error searching FDA database: ${error.message}`);
      return null;
    }
  }

  /**
   * Get drug interactions from FDA database
   */
  async getDrugInteractions(drugName: string): Promise<string | null> {
    try {
      const drugInfo = await this.searchDrug(drugName);
      return drugInfo?.interactions || null;
    } catch (error) {
      this.logger.error(`Error getting drug interactions: ${error.message}`);
      return null;
    }
  }

  /**
   * Get drug warnings
   */
  async getDrugWarnings(drugName: string): Promise<string | null> {
    try {
      const drugInfo = await this.searchDrug(drugName);
      return drugInfo?.warnings || null;
    } catch (error) {
      this.logger.error(`Error getting drug warnings: ${error.message}`);
      return null;
    }
  }

  /**
   * Search for adverse events (side effects reported)
   */
  async searchAdverseEvents(
    drugName: string,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/drug/event.json?search=patient.drug.medicinalproduct:"${drugName}"&limit=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`FDA API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.results) {
        return [];
      }

      return data.results.map((event: any) => ({
        reactions:
          event.patient?.reaction?.map((r: any) => r.reactionmeddrapt) || [],
        seriousness: event.serious,
        reportDate: event.receiptdate,
        patientAge: event.patient?.patientonsetage,
        patientSex: event.patient?.patientsex,
      }));
    } catch (error) {
      this.logger.error(`Error searching adverse events: ${error.message}`);
      return [];
    }
  }

  /**
   * Get recall information for a drug
   */
  async getDrugRecalls(drugName: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/drug/enforcement.json?search=openfda.brand_name:"${drugName}"&limit=10`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`FDA API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.results) {
        return [];
      }

      return data.results.map((recall: any) => ({
        recallNumber: recall.recall_number,
        reason: recall.reason_for_recall,
        status: recall.status,
        classification: recall.classification,
        recallDate: recall.recall_initiation_date,
        productDescription: recall.product_description,
      }));
    } catch (error) {
      this.logger.error(`Error getting drug recalls: ${error.message}`);
      return [];
    }
  }

  /**
   * Enhanced drug interaction check using FDA data + AI
   */
  async checkInteractionsEnhanced(medications: string[]): Promise<{
    fdaData: any[];
    aiAnalysis: string;
  }> {
    try {
      // Get FDA data for each medication
      const fdaData = await Promise.all(
        medications.map(async (med) => {
          const info = await this.searchDrug(med);
          return {
            medication: med,
            interactions: info?.interactions,
            warnings: info?.warnings,
          };
        }),
      );

      // This would be combined with AI analysis from AIService
      return {
        fdaData,
        aiAnalysis: 'Use AIService.getDrugInteractions() for AI analysis',
      };
    } catch (error) {
      this.logger.error(
        `Error in enhanced interaction check: ${error.message}`,
      );
      throw error;
    }
  }
}
