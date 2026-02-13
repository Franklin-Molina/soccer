import React from 'react';

const SystemStatus = ({ timeSinceLastUpdate }) => {
  return (
    <div className="flex justify-end w-full items-center mb-6">
      <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 px-5 py-3 rounded-lg">
        <div className="relative">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
        </div>
        <div>
          <div className="text-green-500 font-medium text-sm">Sistema Activo</div>
          <div className="text-xs text-gray-400">
            Última actualización: {timeSinceLastUpdate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
