
export type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
};

export type LoggerOptions = {
  silent?: boolean;
  verbose?: boolean;
};

export function logger(options: LoggerOptions = {}) {
  const info = (...data: any[]) => {
    if(options.silent !== true) {
      console.info(...data);
    }
  };
  info.verbose = (...data: any[]) => {
    if(options.silent !== true && options.verbose === true) {
      console.info(...data);
    }
  };
  const error = (...data: any[]) => {
    if(options.silent !== true) {
      console.error(...data);
    }
  };
  error.verbose = (...data: any[]) => {
    if(options.silent !== true && options.verbose === true) {
      console.error(...data);
    }
  };
  return {
    info,
    error
  };
}

export const log = logger();
