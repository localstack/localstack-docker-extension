import { COMMON_ARGS, COMMUNITY_CLI, PRO_CLI, START_ARGS, UPDATE_ARGS } from '../../constants';

export interface generateCLIArgsProps {
  call: 'start' | 'update',
  pro?: boolean,
}

export const generateCLIArgs = ({ call, pro = false }: generateCLIArgsProps): string[] => {
  const callArgs = [...COMMON_ARGS];
  if (pro) {
    callArgs.push(...PRO_CLI);
  } else {
    callArgs.push(...COMMUNITY_CLI);
  }

  switch (call) {
    case 'start': callArgs.push(...START_ARGS);
      break;
    default: callArgs.push(...UPDATE_ARGS);
      break;
  }
  return callArgs;

};
