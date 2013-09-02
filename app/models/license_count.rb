class LicenseCount < ActiveRecord::Base
  unloadable

  belongs_to :schedule
end
