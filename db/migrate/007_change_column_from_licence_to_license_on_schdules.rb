class ChangeColumnFromLicenceToLicenseOnSchdules < ActiveRecord::Migration
  def change
    rename_column :schedules, :licence, :license
  end
end
