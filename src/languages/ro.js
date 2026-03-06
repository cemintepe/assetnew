import { AuthSessionMissingError } from "@supabase/supabase-js";

export default {
  auth: {
    username: "Cod Utilizator",
    password: "Parolă",
    login: "AUTENTIFICARE",
    forgot: "Am uitat parola",
    agreement: "Acord de Utilizare",
    privacy: "Politica de Confidențialitate", 
    error: "Eroare de Autentificare",
    fillAll: "Vă rugăm să completați toate câmpurile.",
    invalid_login: "Cod utilizator sau parolă nevalidă."
  },
  common: {
    success: "Succes",
    loading: "Se încarcă...",
    back: "Înapoi",
    error: "Eroare",
    info: "Informație",
    complete: "Finalizează",
    customer: "CLIENT",
    sap_code: "COD SAP",
    dealer: "DEALER",
    ok: "OK"
  },
  dashboard: {
    welcome: "Bun venit",
    find_customer: "Caută client...",
    select_dealer: "Apasă pentru a selecta dealerul",
    no_customer_found: "Nu au fost găsiți clienți pentru acest dealer.",
    no_sync_yet: "Datele nu au fost sincronizate încă.",
    sync_data: "SINCRONIZARE DATE (SYNC)",
    update_sync: "ACTUALIZARE (SYNC)",
    sync_first: "Mai întâi descărcați dealerii folosind butonul 'SYNC'.",
    sync_complete: "clienți au fost salvați cu succes.",
    list_error: "Lista de clienți nu a putut fi preluată.",
    no_address: "PERSOANA DE CONTACT NEPECIFICATĂ",
    soon: "Această acțiune nu este activă încă. Va fi disponibilă foarte curând.",
    soon_label: "ÎN CURÂND",
  },  
  action: {
    title: "Selecție Tip Acțiune",
    select_category: "SELECTAȚI CATEGORIA",
    no_categories: "Nu au fost găsite categorii de afișat.",
    error_loading: "A apărut o eroare la încărcarea categoriilor."
  },
  job_selection: {
    title: "Selecție Tip Activitate",
    selected_category: "CATEGORIA SELECTATĂ",
    list_title: "DEFINIȚI TIPUL CERERII",
    inactive_msg: "nu este activă încă.",
    load_error: "Datele locale nu au putut fi citite."
  },
  inventory: {
    title: "Selecție Inventar",
    stock_status: "STOC CURENT ÎN DEPOZIT",
    available: "DISPONIBIL",
    unit: "BUC",
    product_group: "GRUP DE PRODUSE",
    empty_depot: "Depozitul dealerului selectat pare a fi gol.",
    scanning: "Scanare depozit...",
    barcode: "COD BARE"
  },

  summary: {
    title: "Confirmare Solicitare",
    installation_point: "PUNCT DE INSTALARE",
    requested_equipment: "ECHIPAMENT SOLICITAT",
    job_type: "TIPUL PROCESULUI",
    source: "SURSĂ",
    depot: "DEPOZIT DEALER",
    note_label: "NOTĂ PROCES (OPȚIONAL)",
    note_placeholder: "Orice note pentru tehnician...",
    confirm_btn: "CONFIRMĂ SOLICITAREA",
    footer_info: "ODATĂ CONFIRMATĂ, O COMANDĂ DE LUCRU AUTOMATĂ VA FI CREATĂ ÎN SISTEM.",
    success_title: "SOLICITARE CREATĂ",
    success_sub: "Solicitarea de instalare a fost procesată cu succes.",
    reg_no: "NUMĂR DE ÎNREGISTRARE",
    my_customers: "Înapoi la Clienți"
  },

  verification: {
    title: "VERIFICARE ECHIPAMENT",
    scan_btn: "SCANEAZĂ COD BARE",
    not_belonging: "Acest echipament nu aparține acestei locații!",
    verified_msg: "Echipament verificat cu succes.",
    list_title: "INVENTAR PUNCT DE LUCRU",
    camera_permission: "Permisiune cameră necesară",
    missing: "LIPSEȘTE"
  },

  repair: {
    summary_title: "REZUMAT DEFECȚIUNE",
    point_label: "PUNCT DE REPARAȚIE",
    device_label: "DISPOZITIV DEFECT",
    note_label: "NOTE ȘI DETALII DEFECȚIUNE",
    note_placeholder: "Descrieți defecțiunea în detaliu (ex: Nu răcește, capac rupt...)",
    submit_btn: "RAPORTEAZĂ DEFECȚIUNEA",
    footer_info: "Cererea creată va fi transmisă instantaneu tehnicianului regional.",
    fill_note: "Vă rugăm să furnizați detaliile defecțiunii.",
    submit_error: "Solicitarea dumneavoastră nu a putut fi trimisă.",
    success_title: "CERERE RECEPȚIONATĂ",
    success_sub: "Notificarea dumneavoastră a fost transmisă echipei tehnice.",
    reg_no_label: "NR. ÎNREGISTRARE DEFECȚIUNE"
  }
};