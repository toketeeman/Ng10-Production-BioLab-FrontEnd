export interface IUser {
  username: string;
  password?: string;
  token?: string;
}

export interface ITarget {
  target_name: string;
  target_id?: number;        // Mandatory on the fetch from the DB.
  partner: string;
  protein_class_pk: string;
  notes: string;
  project_name: string;
  subunits: ISubunit[];
}

export interface IGene {
  dna_fasta_description: string;
  dna_sequence: string;
}

export interface ISubunit {
  subunit_name: string;
  subunit_id?: number;          // Mandatory on the fetch from the DB.
  copies: number;
  amino_acid_fasta_description: string;
  amino_acid_sequence: string;
  genes: IGene[];
}

export interface IProteinClass {
  protein_class_name: string;
  protein_class_pk: string;
}

export interface IFastaFile {
  sequence_type: string;
  expected_entry_count: number;
  fasta_file: any;
}

export interface IFastaEntry {
    fasta_description: string;
    sequence_type: string;
    sequence: string;
}

export interface IFastaResponse {
  sequence_type: string;
  expected_entry_count?: number;
  actual_entry_count?: number;
  fasta_entries: IFastaEntry[];
}

export interface ISubunitInteraction {
  subunit_interaction_id?: number;
  subunit_one_name: string;
  subunit_one_copy: number;
  subunit_two_name: string;
  subunit_two_copy: number;
  interaction: string;
}

export interface IPostTranslationalModification {
  subunit_ptm_id?: number;
  subunit_one_name: string;
  subunit_one_copy: number;
  subunit_one_residue: number;
  subunit_two_name: string;
  subunit_two_copy: number;
  subunit_two_residue: number;
  ptm: string;
}

export interface IGridTarget {
  target_id?: number;
  target_name: string;
  partner_name: string;
  class_name: string;
  subunit_count: number;
  gene_count: number;
  project_name: string;
  plasmid_count: number;
}

export interface IGridPlasmid {
  plasmid_id: string;
  description: string;
  marker: string;
  target_name: string;
  project_name: string;
}

export interface IGridPlasmidDetail {
  name: string;
  feature_type: string;
  sequence_span: string;
  strand: string;
  dna_sequence: string;
  feature_qualifier: IGridFeatureQualifier[];
}

export interface IGridFeatureQualifier {
  type: string;
  value: string;
}

export interface ITargetDetailHeader {
  target_name: string;
  target_id?: number;        // Should be returned on the fetch from the DB.
  partner: string;
  protein_class_name: string;
  project_name: string;
  notes: string;
  subunits?: ISubunit[];
}

export interface ITargetDetail {
  target: ITargetDetailHeader;
  interactions: ISubunitInteraction[];
  ptms: IPostTranslationalModification[];
}

export interface ITargetProperties {
  protein: ITargetPropertyList;
  subunits: ITargetPropertyList[];
}

export interface ITargetPropertyList {
  name: string;
  avg_molecular_weight_ox: string;
  monoisotopic_weight_ox: string;
  avg_molecular_weight_red: string;
  monoisotopic_weight_red: string;
  isoelectric_point: string;
  gravy: string;
  aromaticity: string;
  e280_mass_ox: string;
  e280_mass_red: string;
  e214_mass: string;
  e280_molar_ox: string;
  e280_molar_red: string;
  e214_molar: string;
}

export interface IGridBioProperty {
  name: string;
  value: string;
  unit: string;
}

export interface ICurrentRoles {
  groups: string[];
  permissions: string[];
}

export interface IGridPart {
  part_name: string;
  part_type: string;
  plasmids: string[];
}

export interface ISequenceProperties {
  amino_acid_sequence: string;
  avg_molecular_weight_ox: string;
  monoisotopic_weight_ox: string;
  avg_molecular_weight_red: string;
  monoisotopic_weight_red: string;
  isoelectric_point: string;
  gravy: string;
  aromaticity: string;
  e280_mass_ox: string;
  e280_mass_red: string;
  e214_mass: string;
  e280_molar_ox: string;
  e280_molar_red: string;
  e214_molar: string;
}




