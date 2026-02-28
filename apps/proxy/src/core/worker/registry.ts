type WorkerStartFn = () => Promise<void> | void;

class WorkerRegistry {
  private workers = new Map<string, WorkerStartFn>();

  /**
   * Registra um worker para ser iniciado posteriormente.
   * @param name Nome identificador do worker
   * @param startFn Função de inicialização do worker
   */
  register(name: string, startFn: WorkerStartFn) {
    if (this.workers.has(name)) {
      console.warn(`[WorkerRegistry] Worker '${name}' já registrado. Sobrescrevendo.`);
    }
    this.workers.set(name, startFn);
  }

  /**
   * Inicia todos os workers registrados.
   */
  async startAll() {
    console.log(`[WorkerRegistry] Iniciando ${this.workers.size} workers...`);
    for (const [name, start] of this.workers) {
      try {
        console.log(`[WorkerRegistry] Iniciando worker: ${name}`);
        await start();
      } catch (error) {
        console.error(`[WorkerRegistry] Erro ao iniciar worker '${name}':`, error);
      }
    }
  }
}

export const workerRegistry = new WorkerRegistry();
